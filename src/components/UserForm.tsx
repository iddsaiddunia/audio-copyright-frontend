import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiShield, FiAlertCircle, FiPhone } from 'react-icons/fi';

// Define the admin roles based on backend
export type AdminRole = 'content' | 'financial' | 'technical' | 'super';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  password: string;
  confirmPassword: string;
  adminType: AdminRole | '';
}

interface UserFormProps {
  onSubmit: (userData: UserFormData) => void;
  initialData?: Partial<UserFormData>;
  isEditMode?: boolean;
  currentUserRole: AdminRole;
}

const UserForm: React.FC<UserFormProps> = ({ 
  onSubmit, 
  initialData = {}, 
  isEditMode = false,
  currentUserRole
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phoneNumber: initialData.phoneNumber || '',
    idNumber: initialData.idNumber || '',
    password: '',
    confirmPassword: '',
    adminType: initialData.adminType || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID Number is required';
    }
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    if (!formData.adminType) {
      newErrors.adminType = 'Admin type is required';
    } else if (formData.adminType === 'super' && currentUserRole !== 'super') {
      newErrors.adminType = 'Only a super admin can create another super admin';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
          />
          {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
          />
          {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
        />
        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
        <input
          type="text"
          name="phoneNumber"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
        />
        {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>
      <div>
        <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID Number</label>
        <input
          type="text"
          name="idNumber"
          id="idNumber"
          value={formData.idNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
        />
        {errors.idNumber && <p className="text-red-600 text-xs mt-1">{errors.idNumber}</p>}
      </div>
      {!isEditMode && (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
            />
            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </>
      )}
      <div>
        <label htmlFor="adminType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin Type</label>
        <select
          name="adminType"
          id="adminType"
          value={formData.adminType}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota sm:text-sm"
        >
          <option value="">Select admin type</option>
          <option value="content">Content Admin</option>
          <option value="financial">Financial Admin</option>
          <option value="technical">Technical Admin</option>
          <option value="super" disabled={currentUserRole !== 'super'}>Super Admin</option>
        </select>
        {errors.adminType && <p className="text-red-600 text-xs mt-1">{errors.adminType}</p>}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center items-center px-4 py-2 rounded-md bg-cosota text-white font-medium hover:bg-cosota-dark disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isEditMode ? 'Update Admin' : 'Create Admin'}
      </button>
    </form>
  );
};

export default UserForm;
