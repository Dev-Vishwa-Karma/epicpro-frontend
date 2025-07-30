import React, { Component } from 'react';
import ProjectCard from './ProjectCard';
import BlankState from '../../common/BlankState';

class ProjectCards extends Component {
    render() {
        const {
            projects,
            message,
            logged_in_employee_role,
            onToggleStatus,
            onEditProject,
            onDeleteProject,
            employees
        } = this.props;

        // Filter projects for employees: only show active projects
        const visibleProjects = (logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin')
            ? projects
            : projects.filter(project => Number(project.project_is_active) === 1);

        return (
            <div className="row">
                {visibleProjects && visibleProjects.length > 0 ? (
                    visibleProjects.map((project, index) => (
                        <ProjectCard
                            key={project.project_id || index}
                            project={project}
                            logged_in_employee_role={logged_in_employee_role}
                            onToggleStatus={onToggleStatus}
                            onEditProject={onEditProject}
                            onDeleteProject={onDeleteProject}
                            employees={employees}
                        />
                    ))
                ) : (
                    !message && (
                        <div className="col-12">
                            <BlankState message="Projects not available" />
                        </div>
                    )
                )}
            </div>
        );
    }
}

export default ProjectCards;