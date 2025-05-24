import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define payment status types
export type PaymentEntityType = 'track' | 'copyright' | 'transfer' | 'license';

export interface PaymentStatus {
  entityId: string;
  entityType: PaymentEntityType;
  isPaid: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  amount: number;
  transactionId?: string;
}

interface PaymentContextType {
  getPaymentStatus: (entityId: string, entityType: PaymentEntityType) => PaymentStatus | null;
  isPaymentVerified: (entityId: string, entityType: PaymentEntityType) => boolean;
  isPendingVerification: (entityId: string, entityType: PaymentEntityType) => boolean;
  isPaymentRejected: (entityId: string, entityType: PaymentEntityType) => boolean;
  addPaymentRecord: (payment: PaymentStatus) => void;
  updatePaymentStatus: (entityId: string, entityType: PaymentEntityType, status: 'pending' | 'verified' | 'rejected') => void;
  getAllPaymentsByStatus: (status: 'pending' | 'verified' | 'rejected') => PaymentStatus[];
  getAllPaymentsByType: (entityType: PaymentEntityType) => PaymentStatus[];
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [paymentRecords, setPaymentRecords] = useState<PaymentStatus[]>([]);

  // Load payment records from storage on mount
  useEffect(() => {
    const storedRecords = localStorage.getItem('paymentRecords');
    if (storedRecords) {
      try {
        setPaymentRecords(JSON.parse(storedRecords));
      } catch (error) {
        console.error('Error parsing payment records:', error);
      }
    }
  }, []);

  // Save payment records to storage when they change
  useEffect(() => {
    localStorage.setItem('paymentRecords', JSON.stringify(paymentRecords));
  }, [paymentRecords]);

  // Get payment status for a specific entity
  const getPaymentStatus = (entityId: string, entityType: PaymentEntityType): PaymentStatus | null => {
    return paymentRecords.find(record => 
      record.entityId === entityId && record.entityType === entityType
    ) || null;
  };

  // Check if payment is verified for a specific entity
  const isPaymentVerified = (entityId: string, entityType: PaymentEntityType): boolean => {
    const record = getPaymentStatus(entityId, entityType);
    return record ? record.verificationStatus === 'verified' : false;
  };

  // Check if payment is pending verification for a specific entity
  const isPendingVerification = (entityId: string, entityType: PaymentEntityType): boolean => {
    const record = getPaymentStatus(entityId, entityType);
    return record ? record.verificationStatus === 'pending' : false;
  };

  // Check if payment is rejected for a specific entity
  const isPaymentRejected = (entityId: string, entityType: PaymentEntityType): boolean => {
    const record = getPaymentStatus(entityId, entityType);
    return record ? record.verificationStatus === 'rejected' : false;
  };

  // Add a new payment record
  const addPaymentRecord = (payment: PaymentStatus) => {
    setPaymentRecords(prevRecords => {
      // Check if record already exists
      const existingIndex = prevRecords.findIndex(
        record => record.entityId === payment.entityId && record.entityType === payment.entityType
      );
      
      if (existingIndex >= 0) {
        // Update existing record
        const updatedRecords = [...prevRecords];
        updatedRecords[existingIndex] = payment;
        return updatedRecords;
      } else {
        // Add new record
        return [...prevRecords, payment];
      }
    });
  };

  // Update payment verification status
  const updatePaymentStatus = (
    entityId: string, 
    entityType: PaymentEntityType, 
    status: 'pending' | 'verified' | 'rejected'
  ) => {
    setPaymentRecords(prevRecords => {
      return prevRecords.map(record => {
        if (record.entityId === entityId && record.entityType === entityType) {
          return { ...record, verificationStatus: status };
        }
        return record;
      });
    });
  };

  // Get all payments with a specific status
  const getAllPaymentsByStatus = (status: 'pending' | 'verified' | 'rejected'): PaymentStatus[] => {
    return paymentRecords.filter(record => record.verificationStatus === status);
  };

  // Get all payments of a specific type
  const getAllPaymentsByType = (entityType: PaymentEntityType): PaymentStatus[] => {
    return paymentRecords.filter(record => record.entityType === entityType);
  };

  const value = {
    getPaymentStatus,
    isPaymentVerified,
    isPendingVerification,
    isPaymentRejected,
    addPaymentRecord,
    updatePaymentStatus,
    getAllPaymentsByStatus,
    getAllPaymentsByType
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

// Custom hook to use the payment context
export function usePayment() {
  const context = useContext(PaymentContext);
  
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  
  return context;
}
