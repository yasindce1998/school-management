package config

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// SetupDatabase initializes the database connection
func SetupDatabase(config *Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(config.GetDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Connected to database successfully")
	return db, nil
}
