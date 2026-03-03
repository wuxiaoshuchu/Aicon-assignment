package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	databaseInfra "Aicon-assignment/internal/infrastructure/database"
	itemController "Aicon-assignment/internal/interfaces/controller/items"
	"Aicon-assignment/internal/interfaces/controller/system"
	itemDatabase "Aicon-assignment/internal/interfaces/database"
	"Aicon-assignment/internal/usecase"
)

// サーバー用の構造体
type Server struct{}

func NewServer() *Server {
	return &Server{}
}

// サーバー起動
func (s *Server) Run(ctx context.Context) error {
	e := echo.New()

	// CORS ミドルウェアを追加（ここに追加！）
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:5173",  // Vite のデフォルトポート
			"http://localhost:3000",  // 他のポートも許可
			"http://127.0.0.1:5173",
			"http://127.0.0.1:3000",
		},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			"Content-Type",
			"Authorization",
		},
		AllowCredentials: true,
	}))


	// 依存性注入
	dbHandler := databaseInfra.NewSqlHandler()
	defer dbHandler.Close()

	itemRepo := &itemDatabase.ItemRepository{
		SqlHandler: dbHandler,
	}

	itemUsecase := usecase.NewItemUsecase(itemRepo)

	systemHandler := system.NewSystemHandler()
	itemHandler := itemController.NewItemHandler(itemUsecase)

	// ヘルスチェック
	e.GET("/health", func(c echo.Context) error {
		systemHandler.Health(c)
		return nil
	})

	// アイテムに関するエンドポイント
	itemsGroup := e.Group("/items")
	{
		itemsGroup.GET("", itemHandler.GetItems)           // GET /items
		itemsGroup.POST("", itemHandler.CreateItem)        // POST /items
		itemsGroup.GET("/:id", itemHandler.GetItem)        // GET /items/{id}
		itemsGroup.PUT("/:id", itemHandler.UpdateItem)     // PUT /items/{id}
		itemsGroup.DELETE("/:id", itemHandler.DeleteItem)  // DELETE /items/{id}
		itemsGroup.GET("/summary", itemHandler.GetSummary) // GET /items/summary (bonus)
	}

	return s.startWithGracefulShutdown(ctx, e)
}

func (s *Server) startWithGracefulShutdown(ctx context.Context, e *echo.Echo) error {
	go func() {
		port := ":8080"
		fmt.Printf("🚀 Server starting on port %s\n", port)

		if err := e.Start(port); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("Server startup failed:", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	select {
	case <-quit:
		fmt.Println("\n🛑 Shutting down server...")
	case <-ctx.Done():
		fmt.Println("\n🛑 Context cancelled, shutting down server...")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("server forced to shutdown: %w", err)
	}

	fmt.Println("✅ Server exited gracefully")
	return nil
}
