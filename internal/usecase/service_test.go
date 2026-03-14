package usecase

// 第一段：fakeItemRepo（假仓库）
// 	不是「返回类型」，而是一个假的、可控制的 Repository 实现。
// 	正常运行时：Controller → Usecase → 真实 Repository → 数据库。
// 测试时不想动数据库，所以用 fakeItemRepo 代替真实 Repository。
// 	它做两件事：
// 		按你事先设好的值返回：returnItems、returnErr，所以「查 DB」变成「返回你写死的数据」。
// 		记下「被怎么调用了」：在 Search 里把 name, category, sort 存到 searchName, searchCategory, searchSort，后面用 assert 检查「Usecase 有没有把参数原样传给 Repository」。
// 所以：第一段 = 做一个可控制的、会「记下调用方式」的假 Repository。

import (
	"context"
	"testing"
	"time"

	"Aicon-assignment/internal/domain/entity"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// fakeItemRepo はテスト用の偽 Repository。Search が呼ばれた時の引数と返り値を記録する。
type fakeItemRepo struct {
	searchCalled bool
	searchName   string
	searchCategory string
	searchSort   string
	returnItems  []*entity.Item
	returnErr    error
}

func (f *fakeItemRepo) Search(ctx context.Context, name, category, sort string) ([]*entity.Item, error) {
	f.searchCalled = true
	f.searchName = name
	f.searchCategory = category
	f.searchSort = sort
	return f.returnItems, f.returnErr
}

// 以下、interface の他のメソッド。テストで使わなければ panic でよい。
func (f *fakeItemRepo) FindAll(ctx context.Context) ([]*entity.Item, error) { return nil, nil }
func (f *fakeItemRepo) FindByID(ctx context.Context, id int64) (*entity.Item, error) { return nil, nil }
func (f *fakeItemRepo) Create(ctx context.Context, item *entity.Item) (*entity.Item, error) { return nil, nil }
func (f *fakeItemRepo) Update(ctx context.Context, item *entity.Item) (*entity.Item, error) { return nil, nil }
func (f *fakeItemRepo) Delete(ctx context.Context, id int64) error { return nil }
func (f *fakeItemRepo) GetSummaryByCategory(ctx context.Context) (map[string]int, error) { return nil, nil }

func TestSearchItems(t *testing.T) {
	ctx := context.Background()

	// 用 fakeItemRepo 构造一个「返回固定 1 个 item」的 fake。
	now := time.Now()
	fake := &fakeItemRepo{
		returnItems: []*entity.Item{
		// 返回的 []*entity.Item 长度 1、且那一个 item の内容が fake で入れたものと一致。
			{
				ID:            1,
				Name:          "ロレックス",
				Category:      "時計",
				Brand:         "ROLEX",
				PurchasePrice: 1500000,
				PurchaseDate:  "2023-01-15",
				CreatedAt:     now,
				UpdatedAt:     now,
			},
		},
	}
	// NewItemUsecase(fake) 得到 usecase，调用 SearchItems(ctx, "rolex", "時計", "price_asc")。
	uc := NewItemUsecase(fake)
    
	// 真的调用 SearchItems
	items, err := uc.SearchItems(ctx, "rolex", "時計", "price_asc")

	require.NoError(t, err)
	require.True(t, fake.searchCalled)
	assert.Equal(t, "rolex", fake.searchName)
	assert.Equal(t, "時計", fake.searchCategory)
	assert.Equal(t, "price_asc", fake.searchSort)
	assert.Len(t, items, 1)
	assert.Equal(t, "ロレックス", items[0].Name)
}