import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePayment, type PaymentEntityType } from '../contexts/PaymentContext';

interface PaymentVerificationRequiredProps {
  children: ReactNode;
  entityId: string;
  entityType: PaymentEntityType;
  redirectPath?: string;
  excludeArtistVerification?: boolean;
}

/**
 * A component that checks if a payment has been verified before rendering its children.
 * If the payment is not verified, it redirects to the specified path or shows a message.
 * 
 * @param children The content to render if payment is verified
 * @param entityId The ID of the entity requiring payment verification
 * @param entityType The type of entity (copyright, license, transfer, track)
 * @param redirectPath Optional path to redirect to if payment is not verified
 * @param excludeArtistVerification If true, artist verification processes will be allowed to proceed
 */
function PaymentVerificationRequired({
  children,
  entityId,
  entityType,
  redirectPath = '/payment-required',
  excludeArtistVerification = false
}: PaymentVerificationRequiredProps) {
  const { isPaymentVerified } = usePayment();
  
  // Special case: Artist verification is excluded from payment verification requirements
  if (excludeArtistVerification && entityType === 'track' && entityId.startsWith('artist-')) {
    return <>{children}</>;
  }
  
  // Check if payment is verified
  const verified = isPaymentVerified(entityId, entityType);
  
  if (!verified) {
    // If redirectPath is provided, navigate there
    if (redirectPath) {
      return <Navigate to={redirectPath} state={{ entityId, entityType }} replace />;
    }
    
    // Otherwise, render nothing
    return null;
  }
  
  // If payment is verified, render children
  return <>{children}</>;
}

export default PaymentVerificationRequired;
