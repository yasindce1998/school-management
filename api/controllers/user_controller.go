package controllers

import (
	"net/http"
	"strconv"

	"school-management-api/internal/models"
	"school-management-api/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UserController handles user-related HTTP requests
type UserController struct {
	userService services.UserService
}

// NewUserController creates a new instance of UserController
func NewUserController(userService services.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

// GetUsers retrieves all users with pagination
func (c *UserController) GetUsers(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))

	// Get users from service
	users, total, err := c.userService.GetAllUsers(ctx, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{
		"data": users,
		"meta": gin.H{
			"page":      page,
			"pageSize":  pageSize,
			"total":     total,
			"totalPage": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetUser retrieves a user by ID
func (c *UserController) GetUser(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get user from service
	user, err := c.userService.GetUserByID(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, user)
}

// CreateUser creates a new user
func (c *UserController) CreateUser(ctx *gin.Context) {
	// Parse request body
	var user models.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create user
	err := c.userService.CreateUser(ctx, &user)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusCreated, gin.H{"message": "user created successfully", "id": user.ID})
}

// UpdateUser updates a user
func (c *UserController) UpdateUser(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Parse request body
	var user models.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set ID
	user.ID = id

	// Update user
	err = c.userService.UpdateUser(ctx, &user)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "user updated successfully"})
}

// DeleteUser deletes a user
func (c *UserController) DeleteUser(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Delete user
	err = c.userService.DeleteUser(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "user deleted successfully"})
}

// Login handles user login
func (c *UserController) Login(ctx *gin.Context) {
	// Parse request body
	var req models.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Authenticate user
	resp, err := c.userService.Login(ctx, req.Username, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, resp)
}
