// Import all components here
// import React, { Component } from 'react'
import Dashboard from './HRMS/Dashboard/Dashboard';
import Users from './HRMS/Users/Users';
import Departments from './HRMS/Departments/Departments';
import Employee from './HRMS/Employee/Employee';
import AddEmployee from './HRMS/Employee/AddEmployee';
import EditEmployee from './HRMS/Employee/EditEmployee';
import Holidays from './HRMS/Holidays/Holidays';
import Events from './HRMS/Events/Events';
import Activities from './HRMS/Activities/Activities';
import Report from './HRMS/Report/Report';
import Gallery from './HRMS/Gallery/Gallery';
import SaturdaySettings from './HRMS/SaturdaySettings/SaturdaySettings';
import Statistics from './HRMS/Statistics/Statistics';

// import ProjectDashboard from './Project/Dashboard/Dashboard';
import ProjectList from './Project/ProjectList/Projectlist';
import Clients from './Project/Clients/Clients';
import TodoList from './Project/TodoList/TodoList';
import JobPortalDashboard from './JobPortal/Dashboard/Dashboard';
import Applicants from './JobPortal/Applicants/Applicants';
import Positions from './JobPortal/Positions/Positions';
import Resumes from './JobPortal/Resumes/Resumes';
import Settings from './JobPortal/Settings/Settings';
import AppCalendar from './AppPages/AppCalendar';
import AppContact from './AppPages/AppContact';
import AppSetting from './AppPages/AppSetting';
import Login from './Authentication/login';
import ViewEmployee from './HRMS/Employee/ViewEmployee';

const Routes = [
    {
        path: "/",
        name: 'dashboard',
        exact: true,
        pageTitle: "HR Dashboard",
        component: Dashboard,
        roles: ['admin', 'super_admin', 'employee']
    },
    {
        path: "/hr-users",
        name: 'hr-users',
        exact: true,
        pageTitle: "Users",
        adminAccess: true,
        component: Users,
        roles: ['admin', 'super_admin']
    },
    {
        path: "/hr-department",
        name: 'department',
        exact: true,
        pageTitle: "Departments",
        adminAccess: true,
        component: Departments,
        roles: ['admin', 'super_admin']
    },
    {
        path: "/hr-employee",
        name: 'employee',
        exact: true,
        pageTitle: "Employee",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: Employee
    },
    {
        path: "/add-employee",
        name: 'add-employee',
        exact: true,
        pageTitle: "Add Employee",
        adminAccess: true,
        roles: ['admin', 'super_admin'],

        component: AddEmployee
    },
    {
        path: "/edit-employee",
        name: 'edit-employee',
        exact: true,
        pageTitle: "Edit Employee",
        roles: ['admin', 'super_admin'],
        component: EditEmployee
    },
    {
        path: "/view-employee/:id/:activeTab",
        name: 'view-employee',
        exact: true,
        pageTitle: "View Employee",
        adminAccess: true,
        roles: ['admin', 'super_admin', 'employee'],
        component: ViewEmployee
    },
    {
        path: "/view-employee/:id",
        name: 'view-employee',
        exact: true,
        pageTitle: "View Employee",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: ViewEmployee
    },
    {
        path: "/hr-holidays",
        name: 'holidays',
        exact: true,
        pageTitle: "Holidays",
        roles: ['admin', 'super_admin', 'employee'],
        component: Holidays
    },
    {
        path: "/hr-events",
        name: 'events',
        exact: true,
        pageTitle: "Events",
        component: Events,
        roles: ['admin', 'super_admin', 'employee']
    },
    {
        path: "/hr-activities",
        name: 'activities',
        exact: true,
        pageTitle: "Activities",
        component: Activities,
        roles: ['admin', 'super_admin', 'employee']
    },
    {
        path: "/hr-report",
        name: 'report',
        exact: true,
        pageTitle: "Report",
        component: Report,
        roles: ['admin', 'super_admin', 'employee']
    },
    {
        path: "/gallery",
        name: 'gallery',
        exact: true,
        pageTitle: "Image Gallery",
        component: Gallery,
        roles: ['admin', 'super_admin', 'employee']
    },
    {
        path: "/saturday-settings",
        name: 'saturday settings',
        exact: true,
        pageTitle: "Saturday Settings",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: SaturdaySettings
    },
    {
        path: "/statistics",
        name: 'Statistics',
        exact: true,
        pageTitle: "Statistics",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: Statistics
    },
    //project
    {
        path: "/project-list",
        name: 'project-list',
        exact: true,
        pageTitle: "Project",
        roles: ['admin', 'super_admin'],
        component: ProjectList
    },

    {
        path: "/project-clients",
        name: 'project-clients',
        exact: true,
        pageTitle: "Clients",
        roles: ['admin', 'super_admin'],
        component: Clients
    },
    {
        path: "/project-todo",
        name: 'project-todo',
        exact: true,
        pageTitle: "Todo List",
        roles: ['admin', 'super_admin', 'employee'],
        component: TodoList
    },

    //job portal
    {
        path: "/jobportal-dashboard",
        name: 'jobportalDashboard',
        exact: true,
        pageTitle: "Job Dashboard",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: JobPortalDashboard
    },
    {
        path: "/jobportal-positions",
        name: 'jobportalPositions',
        exact: true,
        pageTitle: "Job Positions",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: Positions
    },
    {
        path: "/jobportal-applicants",
        name: 'jobportalpplicants',
        exact: true,
        pageTitle: "Job Applicants",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: Applicants
    },
    {
        path: "/jobportal-resumes",
        name: 'jobportalResumes',
        exact: true,
        pageTitle: "Job Resumes",
        adminAccess: true,
        roles: ['admin', 'super_admin'],
        component: Resumes
    },
    {
        path: "/jobportal-settings",
        name: 'jobportalSettings',
        exact: true,
        adminAccess: true,
        pageTitle: "Job Settings",
        roles: ['admin', 'super_admin'],
        component: Settings
    },
    {
        path: "/login",
        name: 'login',
        exact: true,
        pageTitle: "Tables",
        component: Login
    },
    {
        path: "/app-calendar",
        name: 'app-calendar',
        exact: true,
        pageTitle: "Calendar",
        component: AppCalendar
    },
    {
        path: "/app-contact",
        name: 'app-contact',
        exact: true,
        pageTitle: "Contact",
        component: AppContact
    },
    {
        path: "/app-setting",
        name: 'app-setting',
        exact: true,
        pageTitle: "App Setting",
        component: AppSetting
    },
];

export default Routes;