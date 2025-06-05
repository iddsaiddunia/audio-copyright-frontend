import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiShield, FiAlertCircle, FiPhone } from 'react-icons/fi';

// Define the admin roles based on backend
export type AdminRole = 'content' | 'financial' | 'technical' | 'super';
export type UserRole = AdminRole;

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  password: string;
  confirmPassword: string;
  roles: UserRole[];
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
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    idNumber: initialData.idNumber || '',
    password: '',
    confirmPassword: '',
    roles: initialData.roles || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
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
    
    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be selected';
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

  // Role options for the select dropdown
  const roleOptions: { value: AdminRole; label: string; disabled?: boolean }[] = [
    { value: 'content', label: 'Content Admin' },
    { value: 'financial', label: 'Financial Admin' },
    { value: 'technical', label: 'Technical Admin' },
    { value: 'super', label: 'Super Admin', disabled: currentUserRole !== 'super' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-cosota focus:border-cosota ${
              errors.name 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
            placeholder="Enter full name"
          />
        </div>
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-cosota focus:border-cosota ${
              errors.email 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
            placeholder="Enter email address"
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Phone Number
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiPhone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-cosota focus:border-cosota ${
              errors.phone 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
            placeholder="Enter phone number"
          />
        </div>
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ID Number
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-cosota focus:border-cosota ${
              errors.idNumber 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            }`}
            placeholder="Enter ID Number"
          />
        </div>
        {errors.idNumber && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.idNumber}</p>
        )}
      </div>

      {!isEditMode && (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-cosota focus:border-cosota ${
                  errors.password 
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                }`}
                placeholder="Enter password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pl-10 sm:text-sm rounded-md focus:ring-cosota focus:border-cosota ${
                  errors.confirmPassword 
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                }`}
                placeholder="Confirm password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </>
      )}

      <div className="mb-4">
        <label htmlFor="roles" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Roles
        </label>
        <select
          name="roles"
          id="roles"
          multiple
          value={formData.roles}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value as UserRole);
            setFormData({ ...formData, roles: selected });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cosota focus:ring focus:ring-cosota/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {roleOptions.map(opt => (
            <option key={opt.value} value={opt.value} disabled={!!opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.roles && (
          <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <FiAlertCircle />
            {errors.roles}
          </div>
        )}
      </div>

      {isEditMode ? (
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Password Update</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <p>
                  Leave password fields empty to keep the current password. To change the password, enter a new one.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiShield className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Role Information</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Technical Admins can manage users and system settings.<br />
                  Content Admins can approve tracks and verify artists.<br />
                  Financial Admins can manage payments and generate reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
        >
          {isEditMode ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
