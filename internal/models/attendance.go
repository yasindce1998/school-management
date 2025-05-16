package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AttendanceStatus represents the status of a student's attendance
type AttendanceStatus string

const (
	Present AttendanceStatus = "present"
	Absent  AttendanceStatus = "absent"
	Late    AttendanceStatus = "late"
	Excused AttendanceStatus = "excused"
)

// Attendance tracks student attendance for classes
type Attendance struct {
	Base
	StudentID uuid.UUID        `json:"student_id" gorm:"type:uuid;not null"`
	Student   Student          `json:"student" gorm:"foreignKey:StudentID"`
	CourseID  uuid.UUID        `json:"course_id" gorm:"type:uuid;not null"`
	Course    Course           `json:"course" gorm:"foreignKey:CourseID"`
	Date      time.Time        `json:"date" gorm:"not null"`
	Status    AttendanceStatus `json:"status" gorm:"type:varchar(10);not null"`
	Notes     string           `json:"notes" gorm:"type:text"`
	CreatedBy uuid.UUID        `json:"created_by" gorm:"type:uuid"`
	UpdatedBy uuid.UUID        `json:"updated_by" gorm:"type:uuid"`
}

// BeforeCreate - sets created by
func (a *Attendance) BeforeCreate(tx *gorm.DB) error {
	a.CreatedAt = time.Now()
	return nil
}

// BeforeUpdate - sets updated by
func (a *Attendance) BeforeUpdate(tx *gorm.DB) error {
	a.UpdatedAt = time.Now()
	return nil
}
