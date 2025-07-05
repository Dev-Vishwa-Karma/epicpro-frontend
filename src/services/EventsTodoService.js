import api from '../api/axios';

// Fetch todos for a specific employee
export const fetchTodosByEmployee = async (employeeId) => {
  if (!employeeId) return [];
  try {
    const response = await api.get(`${process.env.REACT_APP_API_URL}/project_todo.php`, {
      params: {
        action: 'view',
        employee_id: employeeId,
      },
    });
    const data = response.data;
    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};
