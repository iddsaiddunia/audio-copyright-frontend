import { FiAlertTriangle, FiClock, FiXCircle } from 'react-icons/fi';
import { usePayment, type PaymentEntityType } from '../contexts/PaymentContext';

interface PaymentRequiredAlertProps {
  entityId: string;
  entityType: PaymentEntityType;
  title: string;
  onPaymentVerified?: () => void;
}

const PaymentRequiredAlert = ({ 
  entityId, 
  entityType, 
  title,
  onPaymentVerified 
}: PaymentRequiredAlertProps) => {
  const { isPaymentVerified, isPendingVerification, isPaymentRejected } = usePayment();
  
  const isVerified = isPaymentVerified(entityId, entityType);
  const isPending = isPendingVerification(entityId, entityType);
  const isRejected = isPaymentRejected(entityId, entityType);
  
  // If payment is verified, call the callback and don't show any alert
  if (isVerified) {
    onPaymentVerified?.();
    return null;
  }
  
  if (isPending) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 dark:bg-yellow-900/20 dark:border-yellow-600">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiClock className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Payment Verification Pending
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                Your payment for {title} is currently being verified by our financial team. 
                This process usually takes 1-2 business days. You will be notified once 
                the verification is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isRejected) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 dark:bg-red-900/20 dark:border-red-600">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiXCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Payment Verification Failed
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                Your payment for {title} could not be verified. This could be due to 
                insufficient funds, incorrect payment details, or other issues. Please 
                contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default case: No payment record found
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 dark:bg-blue-900/20 dark:border-blue-600">
      <div className="flex">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="h-5 w-5 text-blue-400 dark:text-blue-300" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Payment Required
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <p>
              Payment verification is required before this {entityType} can be processed.
              Please complete the payment process to continue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequiredAlert;
