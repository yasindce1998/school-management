package services

import (
	"context"
	"errors"
	"time"

	"school-management-api/internal/models"
	"school-management-api/internal/repositories"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserService defines the interface for user service
type UserService interface {
	CreateUser(ctx context.Context, user *models.User) error
	GetUserByID(ctx context.Context, id uuid.UUID) (*models.UserResponse, error)
	GetAllUsers(ctx context.Context, page, pageSize int) ([]models.UserResponse, int64, error)
	UpdateUser(ctx context.Context, user *models.User) error
	DeleteUser(ctx context.Context, id uuid.UUID) error
	Login(ctx context.Context, username, password string) (*models.LoginResponse, error)
}

// UserServiceImpl implements the UserService interface
type UserServiceImpl struct {
	userRepo  repositories.UserRepository
	jwtSecret string
}

// NewUserService creates a new instance of UserServiceImpl
func NewUserService(userRepo repositories.UserRepository, jwtSecret string) UserService {
	return &UserServiceImpl{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// CreateUser creates a new user
func (s *UserServiceImpl) CreateUser(ctx context.Context, user *models.User) error {
	// Check if user with same username or email already exists
	existingUser, err := s.userRepo.FindByUsername(ctx, user.Username)
	if err == nil && existingUser.ID != uuid.Nil {
		return errors.New("username already taken")
	}

	existingUser, err = s.userRepo.FindByEmail(ctx, user.Email)
	if err == nil && existingUser.ID != uuid.Nil {
		return errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	// Create user
	return s.userRepo.Create(ctx, user)
}

// GetUserByID retrieves a user by their ID
func (s *UserServiceImpl) GetUserByID(ctx context.Context, id uuid.UUID) (*models.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Map to response model
	response := &models.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}

	return response, nil
}

// GetAllUsers retrieves all users with pagination
func (s *UserServiceImpl) GetAllUsers(ctx context.Context, page, pageSize int) ([]models.UserResponse, int64, error) {
	users, total, err := s.userRepo.GetAll(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Map to response models
	var responses []models.UserResponse
	for _, user := range users {
		responses = append(responses, models.UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		})
	}

	return responses, total, nil
}

// UpdateUser updates a user
func (s *UserServiceImpl) UpdateUser(ctx context.Context, user *models.User) error {
	// Check if user exists
	existingUser, err := s.userRepo.GetByID(ctx, user.ID)
	if err != nil {
		return err
	}

	// Check if username is already taken by another user
	if user.Username != existingUser.Username {
		anotherUser, err := s.userRepo.FindByUsername(ctx, user.Username)
		if err == nil && anotherUser.ID != uuid.Nil && anotherUser.ID != user.ID {
			return errors.New("username already taken")
		}
	}

	// Check if email is already registered by another user
	if user.Email != existingUser.Email {
		anotherUser, err := s.userRepo.FindByEmail(ctx, user.Email)
		if err == nil && anotherUser.ID != uuid.Nil && anotherUser.ID != user.ID {
			return errors.New("email already registered")
		}
	}

	// If password is being updated, hash it
	if user.Password != "" && user.Password != existingUser.Password {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashedPassword)
	} else {
		// Keep the existing password
		user.Password = existingUser.Password
	}

	return s.userRepo.Update(ctx, user)
}

// DeleteUser deletes a user
func (s *UserServiceImpl) DeleteUser(ctx context.Context, id uuid.UUID) error {
	// Check if user exists
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.userRepo.Delete(ctx, id)
}

// Login authenticates a user and returns a JWT token
func (s *UserServiceImpl) Login(ctx context.Context, username, password string) (*models.LoginResponse, error) {
	// Find user by username
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.generateJWTToken(user)
	if err != nil {
		return nil, err
	}

	// Map to response model
	response := &models.LoginResponse{
		Token: token,
		User: models.UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		},
	}

	return response, nil
}

// generateJWTToken generates a JWT token for the user
func (s *UserServiceImpl) generateJWTToken(user *models.User) (string, error) {
	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID.String(),
		"name": user.Username,
		"role": user.Role,
		"exp":  time.Now().Add(time.Hour * 24).Unix(), // Token expires after 24 hours
	})

	// Sign token with secret key
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
