// 第三层：外部世界的借口中：访问数据库时，厨房在这里（实现）
package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"Aicon-assignment/internal/domain/entity"
	domainErrors "Aicon-assignment/internal/domain/errors"
)

type ItemRepository struct {
	SqlHandler
}

func (r *ItemRepository) FindAll(ctx context.Context) ([]*entity.Item, error) {
	// FindALL：获取全部商品，不过滤
	query := `
        SELECT id, name, category, brand, purchase_price, purchase_date, created_at, updated_at
        FROM items
        ORDER BY created_at DESC
    `

	rows, err := r.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}
	defer rows.Close()

	var items []*entity.Item
	for rows.Next() {
		item, err := scanItem(rows)
		if err != nil {
			return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	return items, nil
}

func (r *ItemRepository) Search(ctx context.Context, name string, category string, sort string) ([]*entity.Item, error) {
	// Search：按照名字/分类搜索商品
	// name string, category string 就是"这个函数接收两个文字输入"。
	// 当用户在浏览器输入 http://localhost:8080/items?name=rolex&category=時計 时：
	// name 的值就是 "rolex"
	// category 的值就是 "時計"
	// ---- 第 1 段：构建 SQL ----
	query := `
		SELECT id, name, category, brand, purchase_price, purchase_date, created_at, updated_at
		FROM items
		WHERE 1=1`
	//  ↑ 注意这里没有 ORDER BY，也没有换行结束

	args := []interface{}{}
	//  ↑ 声明一个空数组，用来装 SQL 参数（? 对应的值）
	//    JS 等价：const args = []

	if name != "" {
		query += " AND name LIKE ?"
		// query += " AND name LIKE ?" 的意思就是：把 query 这个字符串的尾巴再接上 AND name LIKE ?。
		// += 就是"原来的内容 + 新内容"。
		args = append(args, "%"+name+"%")
	}
	//  ↑ 如果 name 不是空字符串，就加条件
	//    "%rolex%" 表示名字里包含 rolex（前后都能有其他字符）
	//    append(数组, 新元素) = 往数组末尾加一个东西。
	//    args := []interface{}{}          // args 现在是 []（空的）
	//    args = append(args, "rolex")     // args 现在是 ["rolex"]
	// args = append(args, "時計")      // args 现在是 ["rolex", "時計"]

	if category != "" {
		query += " AND category = ?"
		args = append(args, category)
	}
	//  ↑ 如果 category 不是空字符串，就加条件
	//    这里用 = 精确匹配，不用 LIKE
	switch sort{
	case "price_asc":
		query += " ORDER BY purchase_price ASC"
	case "price_desc":
		query += " ORDER BY purchase_price DESC"
	default:
		query += " ORDER BY created_at DESC"	
	}
	// switch は「この値の場合は〇〇、あの値の場合は〇〇、それ以外は〇〇」という条件分岐です。
	// if/else if の連続と同じ意味ですが、すっきり書けます。

	// ---- 第 2 段：执行查询（直接抄 FindAll 的 24-43 行）----
	rows, err := r.Query(ctx, query, args...)
	// "把 query 这条 SQL 发给数据库执行，数据库返回的结果存到 rows 里。"
	// args... 是把 args 数组里的值填到 SQL 里的 ? 占位符。
	// 比如 query 是 WHERE 1=1 AND name LIKE ? AND category = ?，args 是 ["%rolex%", "時計"]，
	// 数据库实际执行的就是 WHERE 1=1 AND name LIKE '%rolex%' AND category = '時計'。
	if err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}
	// "如果数据库执行出错了，就返回错误，函数结束。"
	// Go 里每次调用可能出错的函数后，都要马上检查 err。这是 Go 的固定写法，你会见到一百遍。
	defer rows.Close()
	// "等这个函数结束时，关闭数据库连接。"
	// defer = "推迟到函数结束时再执行"。不关的话会泄漏连接，数据库迟早崩。这也是固定写法。

	var items []*entity.Item
	// "声明一个空的 Item 数组，用来装结果。"
	for rows.Next() {
	// "一行一行遍历数据库返回的结果。"
	// 数据库返回的不是一整个数组，而是像"读文件"一样，一行一行给你。rows.Next() = "还有下一行吗？有的话继续。"
		item, err := scanItem(rows)
		//"把当前这一行的数据，转换成一个 Item 对象。"
		// scanItem 是这个文件最下面定义的辅助函数（第 147 行），
		// 它做的事就是：把数据库返回的一行原始数据（id, name, category...），塞到一个 Item 结构体里。
		if err != nil {
			return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
		}
		items = append(items, item)
		// "把这个 Item 加到结果数组里。"
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}
	// "遍历完之后再检查一次有没有出错。"
	// 	有些错误不会在每一行触发，而是在整个遍历过程中累积的。这行是兜底检查。

	return items, nil
	// "返回结果数组，错误为 nil（没有错误）。"
}
//1. 把菜单（query）交给厨房（数据库） 	 → r.Query()
// 2. 如果厨房着火了，直接跑             → if err != nil
// 3. 记住吃完要洗碗                     → defer rows.Close()
// 4. 准备一个空盘子                     → var items
// 5. 厨房一道一道上菜                   → for rows.Next()
// 6.   把每道菜装盘                     → scanItem + append
// 7. 检查厨房有没有遗留问题             → rows.Err()
// 8. 端着盘子出去                       → return items, nil

func (r *ItemRepository) FindByID(ctx context.Context, id int64) (*entity.Item, error) {
	// FindByID 用 ID 获取一个商品
	query := `
        SELECT id, name, category, brand, purchase_price, purchase_date, created_at, updated_at
        FROM items
        WHERE id = ?
    `

	row := r.QueryRow(ctx, query, id)

	item, err := scanItem(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domainErrors.ErrItemNotFound
		}
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	return item, nil
}

func (r *ItemRepository) Create(ctx context.Context, item *entity.Item) (*entity.Item, error) {
	// Create：创建新商品
	query := `
        INSERT INTO items (name, category, brand, purchase_price, purchase_date)
        VALUES (?, ?, ?, ?, ?)
    `

	result, err := r.Execute(ctx, query,
		item.Name,
		item.Category,
		item.Brand,
		item.PurchasePrice,
		item.PurchaseDate,
	)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("%w: failed to get last insert id: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	return r.FindByID(ctx, id)
}

func (r *ItemRepository) Delete(ctx context.Context, id int64) error {
	// Delete 删除商品
	query := `DELETE FROM items WHERE id = ?`

	result, err := r.Execute(ctx, query, id)
	if err != nil {
		return fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("%w: failed to get rows affected: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	if rowsAffected == 0 {
		return domainErrors.ErrItemNotFound
	}

	return nil
}

func (r *ItemRepository) GetSummaryByCategory(ctx context.Context) (map[string]int, error) {
	// GetSummaryByCategory：按分类统计数量
	query := `
        SELECT category, COUNT(*) as count
        FROM items
        GROUP BY category
    `

	rows, err := r.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}
	defer rows.Close()

	summary := make(map[string]int)
	for rows.Next() {
		var category string
		var count int
		if err := rows.Scan(&category, &count); err != nil {
			return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
		}
		summary[category] = count
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	return summary, nil
}

func scanItem(scanner interface {
	Scan(dest ...interface{}) error
}) (*entity.Item, error) {
	var item entity.Item
	var purchaseDate string
	var createdAt, updatedAt time.Time

	err := scanner.Scan(
		&item.ID,
		&item.Name,
		&item.Category,
		&item.Brand,
		&item.PurchasePrice,
		&purchaseDate,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		return nil, err
	}

	if purchaseDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", purchaseDate); err == nil {
			item.PurchaseDate = parsedDate.Format("2006-01-02")
		} else {
			item.PurchaseDate = purchaseDate
		}
	}

	item.CreatedAt = createdAt
	item.UpdatedAt = updatedAt

	return &item, nil
}

func (r *ItemRepository) Update(ctx context.Context, item *entity.Item) (*entity.Item, error) {
	// Update：更新商品
	query := `
		UPDATE items
		SET name = ?, category = ?, brand = ?, purchase_price = ?, purchase_date = ?
		WHERE id = ?
	`

	result, err := r.Execute(ctx, query,
		item.Name,
		item.Category,
		item.Brand,
		item.PurchasePrice,
		item.PurchaseDate,
		item.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("%w: failed to get rows affected: %s", domainErrors.ErrDatabaseError, err.Error())
	}

	if rowsAffected == 0 {
		return nil, domainErrors.ErrItemNotFound
	}

	return r.FindByID(ctx, item.ID)
}