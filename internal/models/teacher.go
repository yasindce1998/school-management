package models

import (
	"github.com/google/uuid"
)

// Teacher represents a teacher in the school
type Teacher struct {
	Base
	FirstName      string      `json:"first_name"`
	LastName       string      `json:"last_name"`
	Email          string      `json:"email" gorm:"uniqueIndex"`
	Specialization string      `json:"specialization"`
	Phone          string      `json:"phone"`
	Address        string      `json:"address"`
	CourseIDs      []uuid.UUID `json:"course_ids" gorm:"-"`
	Courses        []Course    `json:"courses" gorm:"many2many:teacher_courses;"`
}

// TeacherResponse is the API response structure for teachers
type TeacherResponse struct {
	ID             uuid.UUID `json:"id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Email          string    `json:"email"`
	Specialization string    `json:"specialization"`
	Phone          string    `json:"phone"`
	Address        string    `json:"address"`
	Courses        []Course  `json:"courses,omitempty"`
}
