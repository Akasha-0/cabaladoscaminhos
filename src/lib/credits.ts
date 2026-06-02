// fallow-ignore-file unused-file
/**
 * Credits module - re-exports from banking/credit-system
 */
export {
  getCredits,
  getCreditInfo,
  deductCredits,
  addCredits,
  trackCreditUsage,
  InsufficientCreditsError,
  type CreditInfo,
} from '@/lib/banking/credit-system';