package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a system user (admin, staff)
type User struct {
	Base
	Username  string `json:"username" gorm:"uniqueIndex"`
	Email     string `json:"email" gorm:"uniqueIndex"`
	Password  string `json:"-"` // Never return password in JSON
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"` // Admin, Staff, etc.
}

// UserResponse is the API response structure for users
type UserResponse struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// LoginRequest represents the login request structure
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents the login response structure
type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}
