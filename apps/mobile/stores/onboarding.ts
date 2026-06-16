import { create } from 'zustand';

/**
 * Onboarding store for post-verify new sign-up flow.
 *
 * Intentionally NOT persisted — onboarding is a one-shot, in-memory flow
 * driven by the 4-step wizard under `app/(auth)/onboarding/*`. The final
 * step logs the collected data; actual persistence to Clerk user metadata
 * is a follow-up story.
 */

export type ServiceBranch =
  | 'Army'
  | 'Navy'
  | 'Marines'
  | 'Air Force'
  | 'Coast Guard'
  | 'Space Force';

export type ServiceStatus = 'Active duty' | 'Veteran' | 'Reserve' | 'Retired';

export interface OnboardingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface OnboardingEmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
}

export interface OnboardingData {
  branch: ServiceBranch | null;
  status: ServiceStatus | null;
  dd214Uploaded: boolean;
  address: OnboardingAddress;
  emergencyContact: OnboardingEmergencyContact;
  termsAccepted: boolean;
}

interface OnboardingState extends OnboardingData {
  setBranch: (branch: ServiceBranch | null) => void;
  setStatus: (status: ServiceStatus | null) => void;
  setDd214Uploaded: (value: boolean) => void;
  setAddress: (address: Partial<OnboardingAddress>) => void;
  setEmergencyContact: (contact: Partial<OnboardingEmergencyContact>) => void;
  setTermsAccepted: (value: boolean) => void;
  reset: () => void;
}

const initialState: OnboardingData = {
  branch: null,
  status: null,
  dd214Uploaded: false,
  address: { street: '', city: '', state: '', zip: '' },
  emergencyContact: { fullName: '', relationship: '', phone: '' },
  termsAccepted: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setBranch: (branch) => set({ branch }),
  setStatus: (status) => set({ status }),
  setDd214Uploaded: (dd214Uploaded) => set({ dd214Uploaded }),
  setAddress: (address) => set((state) => ({ address: { ...state.address, ...address } })),
  setEmergencyContact: (contact) =>
    set((state) => ({ emergencyContact: { ...state.emergencyContact, ...contact } })),
  setTermsAccepted: (termsAccepted) => set({ termsAccepted }),
  reset: () => set({ ...initialState }),
}));
