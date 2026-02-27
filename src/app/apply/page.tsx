'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import PremiumLoader from '@/components/PremiumLoader';

const startupSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  website: z.string().url().optional().or(z.literal('')),
  hq: z.string().optional(),
  incorporationCountry: z.string().optional(),
  stage: z.string().optional(),
  sector: z.string().optional(),
  b2bB2c: z.string().optional(),
  tractionHighlights: z.string().optional(),
  founders: z.string().optional(),
  teamRoles: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  problem: z.string().optional(),
  solution: z.string().optional(),
  differentiation: z.string().optional(),
  moat: z.string().optional(),
  revenue: z.string().optional(),
  growth: z.string().optional(),
  users: z.string().optional(),
  retention: z.string().optional(),
  cac: z.string().optional(),
  ltv: z.string().optional(),
  roundType: z.string().optional(),
  targetAmount: z.string().optional(),
  valuation: z.string().optional(),
  useOfFunds: z.string().optional(),
});

type StartupFormData = z.infer<typeof startupSchema>;

const STEPS = [
  { id: 'company', title: 'Company' },
  { id: 'team', title: 'Team' },
  { id: 'product', title: 'Product' },
  { id: 'metrics', title: 'Metrics' },
  { id: 'fundraising', title: 'Fundraising' },
  { id: 'documents', title: 'Documents' },
];

export default function ApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StartupFormData>({
    companyName: '',
    website: '',
    hq: '',
    incorporationCountry: '',
    stage: '',
    sector: '',
    b2bB2c: '',
    tractionHighlights: '',
    founders: '',
    teamRoles: '',
    linkedin: '',
    problem: '',
    solution: '',
    differentiation: '',
    moat: '',
    revenue: '',
    growth: '',
    users: '',
    retention: '',
    cac: '',
    ltv: '',
    roundType: '',
    targetAmount: '',
    valuation: '',
    useOfFunds: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState({ email: '', password: '', name: '' });
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const updateField = (field: keyof StartupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      const companyName = formData.companyName || '';
      if (!companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!accountData.email || !accountData.password || !accountData.name) {
      setErrors({ account: 'Please fill in all account fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/startups/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          account: accountData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const startupId = data.startupId;

        if (pitchDeck && startupId) {
          setUploading(true);
          const formDataUpload = new FormData();
          formDataUpload.append('file', pitchDeck);
          formDataUpload.append('startupId', startupId);
          formDataUpload.append('type', 'pitch_deck');

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          });

          if (!uploadRes.ok) {
            const uploadError = await uploadRes.json();
            console.error('Upload failed:', uploadError);
          }
        }

        router.push('/login?registered=true');
      } else {
        const data = await response.json();
        setErrors(data.errors || { submit: data.message || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const inputClass = "input bg-dark-900/50 border-dark-700 text-white placeholder-dark-500 focus:ring-primary-500";
  const labelClass = "label text-dark-300";

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'company':
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
            <div>
              <label className={labelClass}>Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className={`${inputClass} ${errors.companyName ? 'border-red-500' : ''}`}
                placeholder="Your company name"
              />
              {errors.companyName && (
                <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                className={inputClass}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>HQ Location</label>
                <input
                  type="text"
                  value={formData.hq}
                  onChange={(e) => updateField('hq', e.target.value)}
                  className={inputClass}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className={labelClass}>Incorporation Country</label>
                <input
                  type="text"
                  value={formData.incorporationCountry}
                  onChange={(e) => updateField('incorporationCountry', e.target.value)}
                  className={inputClass}
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => updateField('stage', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select stage</option>
                  <option value="idea">Idea</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A+</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateField('sector', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select sector</option>
                  <option value="fintech">Fintech</option>
                  <option value="saas">SaaS</option>
                  <option value="healthtech">Healthtech</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="ai-ml">AI/ML</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>B2B / B2C</label>
              <div className="flex gap-6 mt-2">
                {['B2B', 'B2C', 'BOTH'].map((option) => (
                  <label key={option} className="flex items-center text-dark-300 cursor-pointer">
                    <input
                      type="radio"
                      name="b2bB2c"
                      value={option}
                      checked={formData.b2bB2c === option}
                      onChange={(e) => updateField('b2bB2c', e.target.value)}
                      className="mr-2 w-4 h-4 text-primary-500 bg-dark-800 border-dark-600 focus:ring-primary-500"
                    />
                    {option === 'BOTH' ? 'Both' : option}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Traction Highlights</label>
              <textarea
                value={formData.tractionHighlights}
                onChange={(e) => updateField('tractionHighlights', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Key metrics, milestones, achievements..."
              />
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-6">Team Information</h2>
            <div>
              <label className={labelClass}>Founders</label>
              <input
                type="text"
                value={formData.founders}
                onChange={(e) => updateField('founders', e.target.value)}
                className={inputClass}
                placeholder="Founder names (comma separated)"
              />
            </div>
            <div>
              <label className={labelClass}>Team Roles</label>
              <input
                type="text"
                value={formData.teamRoles}
                onChange={(e) => updateField('teamRoles', e.target.value)}
                className={inputClass}
                placeholder="CEO, CTO, COO, etc."
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                className={inputClass}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-6">Product Information</h2>
            <div>
              <label className={labelClass}>Problem</label>
              <textarea
                value={formData.problem}
                onChange={(e) => updateField('problem', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="What problem are you solving?"
              />
            </div>
            <div>
              <label className={labelClass}>Solution</label>
              <textarea
                value={formData.solution}
                onChange={(e) => updateField('solution', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="How do you solve this problem?"
              />
            </div>
            <div>
              <label className={labelClass}>Differentiation</label>
              <textarea
                value={formData.differentiation}
                onChange={(e) => updateField('differentiation', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="What makes you different from competitors?"
              />
            </div>
            <div>
              <label className={labelClass}>Moat</label>
              <textarea
                value={formData.moat}
                onChange={(e) => updateField('moat', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="What's your competitive advantage?"
              />
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-6">Metrics (Optional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Monthly Revenue</label>
                <input
                  type="text"
                  value={formData.revenue}
                  onChange={(e) => updateField('revenue', e.target.value)}
                  className={inputClass}
                  placeholder="$10,000"
                />
              </div>
              <div>
                <label className={labelClass}>Growth Rate</label>
                <input
                  type="text"
                  value={formData.growth}
                  onChange={(e) => updateField('growth', e.target.value)}
                  className={inputClass}
                  placeholder="20% MoM"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Active Users</label>
                <input
                  type="text"
                  value={formData.users}
                  onChange={(e) => updateField('users', e.target.value)}
                  className={inputClass}
                  placeholder="1,000"
                />
              </div>
              <div>
                <label className={labelClass}>Retention Rate</label>
                <input
                  type="text"
                  value={formData.retention}
                  onChange={(e) => updateField('retention', e.target.value)}
                  className={inputClass}
                  placeholder="85%"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>CAC</label>
                <input
                  type="text"
                  value={formData.cac}
                  onChange={(e) => updateField('cac', e.target.value)}
                  className={inputClass}
                  placeholder="$50"
                />
              </div>
              <div>
                <label className={labelClass}>LTV</label>
                <input
                  type="text"
                  value={formData.ltv}
                  onChange={(e) => updateField('ltv', e.target.value)}
                  className={inputClass}
                  placeholder="$500"
                />
              </div>
            </div>
          </div>
        );

      case 'fundraising':
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-6">Fundraising</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Round Type</label>
                <select
                  value={formData.roundType}
                  onChange={(e) => updateField('roundType', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select round</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B+</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Target Amount</label>
                <input
                  type="text"
                  value={formData.targetAmount}
                  onChange={(e) => updateField('targetAmount', e.target.value)}
                  className={inputClass}
                  placeholder="$1,000,000"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Expected Valuation</label>
              <input
                type="text"
                value={formData.valuation}
                onChange={(e) => updateField('valuation', e.target.value)}
                className={inputClass}
                placeholder="$10,000,000"
              />
            </div>
            <div>
              <label className={labelClass}>Use of Funds</label>
              <textarea
                value={formData.useOfFunds}
                onChange={(e) => updateField('useOfFunds', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="How will you use the funds?"
              />
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

            <div className="card bg-dark-900/50 border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Your Name *</label>
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    className={inputClass}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className={labelClass}>Password *</label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    className={inputClass}
                    placeholder="Create a password"
                  />
                </div>
              </div>
            </div>

            <div className="card bg-dark-900/50 border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Pitch Deck</h3>
              <p className="text-dark-400 text-sm mb-4">
                Upload your pitch deck (PDF) - You can also add this later.
              </p>
              <div className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-primary-500/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPitchDeck(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pitch-deck-upload"
                />
                <label
                  htmlFor="pitch-deck-upload"
                  className="cursor-pointer text-primary-500 hover:text-primary-400"
                >
                  {pitchDeck ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {pitchDeck.name}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Click to upload PDF
                    </span>
                  )}
                </label>
                {pitchDeck && (
                  <button
                    onClick={(e) => { e.preventDefault(); setPitchDeck(null); }}
                    className="ml-3 text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
                <p className="text-dark-500 text-sm mt-2">PDF up to 10MB</p>
              </div>
            </div>

            <div className="card bg-dark-900/50 border-dark-700 p-6">
              <label className="flex items-start text-dark-300 cursor-pointer">
                <input type="checkbox" className="mt-1 mr-3 w-4 h-4 text-primary-500 bg-dark-800 border-dark-600 rounded focus:ring-primary-500" required />
                <span className="text-sm">
                  I agree to the Terms of Service and Privacy Policy. I confirm that all information provided is accurate.
                </span>
              </label>
            </div>

            {errors.account && (
              <p className="text-red-400 text-sm">{errors.account}</p>
            )}
            {errors.submit && (
              <p className="text-red-400 text-sm">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="card bg-dark-900/80 border-dark-700 p-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Apply as a Startup
          </h1>
          <p className="text-dark-400 text-center mb-8">Submit your application to connect with investors</p>

          {/* Progress Steps */}
          <div className="flex justify-between mb-10 relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-800 -z-10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-primary-500 -z-10 transition-all duration-300"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-primary-500 text-white'
                      : index === currentStep
                      ? 'bg-primary-600 text-white ring-4 ring-primary-500/30'
                      : 'bg-dark-800 text-dark-400'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-2 ${index <= currentStep ? 'text-white' : 'text-dark-500'}`}>{step.title}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">{renderStep()}</div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-dark-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="btn-ghost text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="btn-primary"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

        {/* Premium Loading Overlay */}
        {(loading || uploading) && (
          <PremiumLoader
            message={uploading ? 'Uploading Documents...' : 'Submitting Application...'}
            submessage={uploading
              ? 'Please wait while we upload your pitch deck...'
              : 'Please wait while we process your application...'}
          />
        )}
      </div>
    </div>
  );
}
