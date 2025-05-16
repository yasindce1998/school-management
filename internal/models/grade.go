package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Grade represents a student's grade for a specific course
type Grade struct {
	Base
	StudentID uuid.UUID `json:"student_id" gorm:"type:uuid;not null"`
	Student   Student   `json:"student" gorm:"foreignKey:StudentID"`
	CourseID  uuid.UUID `json:"course_id" gorm:"type:uuid;not null"`
	Course    Course    `json:"course" gorm:"foreignKey:CourseID"`
	Score     float64   `json:"score" gorm:"not null"`
	Grade     string    `json:"grade" gorm:"size:2"` // A+, A, B+, B, etc.
	Term      string    `json:"term" gorm:"size:20"` // Fall 2023, Spring 2024, etc.
	CreatedBy uuid.UUID `json:"created_by" gorm:"type:uuid"`
	UpdatedBy uuid.UUID `json:"updated_by" gorm:"type:uuid"`
}

// BeforeCreate - sets created by
func (g *Grade) BeforeCreate(tx *gorm.DB) error {
	g.CreatedAt = time.Now()
	return nil
}

// BeforeUpdate - sets updated by
func (g *Grade) BeforeUpdate(tx *gorm.DB) error {
	g.UpdatedAt = time.Now()
	return nil
}

// Calculate the letter grade based on score
func (g *Grade) CalculateGrade() {
	switch {
	case g.Score >= 97:
		g.Grade = "A+"
	case g.Score >= 93:
		g.Grade = "A"
	case g.Score >= 90:
		g.Grade = "A-"
	case g.Score >= 87:
		g.Grade = "B+"
	case g.Score >= 83:
		g.Grade = "B"
	case g.Score >= 80:
		g.Grade = "B-"
	case g.Score >= 77:
		g.Grade = "C+"
	case g.Score >= 73:
		g.Grade = "C"
	case g.Score >= 70:
		g.Grade = "C-"
	case g.Score >= 67:
		g.Grade = "D+"
	case g.Score >= 63:
		g.Grade = "D"
	case g.Score >= 60:
		g.Grade = "D-"
	default:
		g.Grade = "F"
	}
}
