package config

import (
	"log"

	"school-management-api/internal/models"

	"gorm.io/gorm"
)

// MigrateDB runs database migrations
func MigrateDB(db *gorm.DB) error {
	log.Println("Running database migrations...")
	// Auto-migrate schemas
	err := db.AutoMigrate(
		&models.User{},
		&models.Student{},
		&models.Teacher{},
		&models.Course{},
		&models.Grade{},
		&models.Attendance{},
	)
	if err != nil {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// SeedDB seeds the database with initial data if needed
func SeedDB(db *gorm.DB) error {
	// Check if admin user exists
	var count int64
	db.Model(&models.User{}).Where("role = ?", "Admin").Count(&count)

	// If no admin user exists, create one
	if count == 0 {
		log.Println("Creating default admin user...")
		adminUser := models.User{
			Username:  "admin",
			Email:     "admin@school.com",
			Password:  "$2a$10$XVaJE5Dk6zOWoaQqx2tKSeCZ2VJXwwrT.D8i52GQHjgybvUqz.xD.", // password: admin123
			FirstName: "Admin",
			LastName:  "User",
			Role:      "Admin",
		}

		if err := db.Create(&adminUser).Error; err != nil {
			return err
		}
		log.Println("Default admin user created")
	}

	return nil
}
