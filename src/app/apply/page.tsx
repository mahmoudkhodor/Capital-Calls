'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

const startupSchema = z.object({
  // Company
  companyName: z.string().min(1, 'Company name is required'),
  website: z.string().url().optional().or(z.literal('')),
  hq: z.string().optional(),
  incorporationCountry: z.string().optional(),
  stage: z.string().optional(),
  sector: z.string().optional(),
  b2bB2c: z.string().optional(),
  tractionHighlights: z.string().optional(),
  // Team
  founders: z.string().optional(),
  teamRoles: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  // Product
  problem: z.string().optional(),
  solution: z.string().optional(),
  differentiation: z.string().optional(),
  moat: z.string().optional(),
  // Metrics
  revenue: z.string().optional(),
  growth: z.string().optional(),
  users: z.string().optional(),
  retention: z.string().optional(),
  cac: z.string().optional(),
  ltv: z.string().optional(),
  // Fundraising
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

    // Always allow moving to next step for now
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

        // Upload pitch deck if selected
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
            // Continue anyway - the startup was created successfully
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

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'company':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white ${
                  errors.companyName ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Your company name"
              />
              {errors.companyName && (
                <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  HQ Location
                </label>
                <input
                  type="text"
                  value={formData.hq}
                  onChange={(e) => updateField('hq', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Incorporation Country
                </label>
                <input
                  type="text"
                  value={formData.incorporationCountry}
                  onChange={(e) => updateField('incorporationCountry', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => updateField('stage', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">Select stage</option>
                  <option value="idea">Idea</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateField('sector', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
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
              <label className="block text-sm font-medium text-gray-300 mb-1">
                B2B / B2C
              </label>
              <div className="flex gap-4">
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    name="b2bB2c"
                    value="B2B"
                    checked={formData.b2bB2c === 'B2B'}
                    onChange={(e) => updateField('b2bB2c', e.target.value)}
                    className="mr-2"
                  />
                  B2B
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    name="b2bB2c"
                    value="B2C"
                    checked={formData.b2bB2c === 'B2C'}
                    onChange={(e) => updateField('b2bB2c', e.target.value)}
                    className="mr-2"
                  />
                  B2C
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    name="b2bB2c"
                    value="BOTH"
                    checked={formData.b2bB2c === 'BOTH'}
                    onChange={(e) => updateField('b2bB2c', e.target.value)}
                    className="mr-2"
                  />
                  Both
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Traction Highlights
              </label>
              <textarea
                value={formData.tractionHighlights}
                onChange={(e) => updateField('tractionHighlights', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="Key metrics, milestones, achievements..."
              />
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Team Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Founders
              </label>
              <input
                type="text"
                value={formData.founders}
                onChange={(e) => updateField('founders', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="Founder names (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Team Roles
              </label>
              <input
                type="text"
                value={formData.teamRoles}
                onChange={(e) => updateField('teamRoles', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="CEO, CTO, COO, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Product Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Problem
              </label>
              <textarea
                value={formData.problem}
                onChange={(e) => updateField('problem', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="What problem are you solving?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Solution
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) => updateField('solution', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="How do you solve this problem?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Differentiation
              </label>
              <textarea
                value={formData.differentiation}
                onChange={(e) => updateField('differentiation', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="What makes you different from competitors?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Moat
              </label>
              <textarea
                value={formData.moat}
                onChange={(e) => updateField('moat', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="What's your competitive advantage?"
              />
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Metrics (Optional)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Monthly Revenue
                </label>
                <input
                  type="text"
                  value={formData.revenue}
                  onChange={(e) => updateField('revenue', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="$10,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Growth Rate
                </label>
                <input
                  type="text"
                  value={formData.growth}
                  onChange={(e) => updateField('growth', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="20% MoM"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Active Users
                </label>
                <input
                  type="text"
                  value={formData.users}
                  onChange={(e) => updateField('users', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="1,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Retention Rate
                </label>
                <input
                  type="text"
                  value={formData.retention}
                  onChange={(e) => updateField('retention', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="85%"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  CAC (Customer Acquisition Cost)
                </label>
                <input
                  type="text"
                  value={formData.cac}
                  onChange={(e) => updateField('cac', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="$50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  LTV (Lifetime Value)
                </label>
                <input
                  type="text"
                  value={formData.ltv}
                  onChange={(e) => updateField('ltv', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="$500"
                />
              </div>
            </div>
          </div>
        );

      case 'fundraising':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Fundraising</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Round Type
                </label>
                <select
                  value={formData.roundType}
                  onChange={(e) => updateField('roundType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">Select round</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Amount
                </label>
                <input
                  type="text"
                  value={formData.targetAmount}
                  onChange={(e) => updateField('targetAmount', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="$1,000,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Expected Valuation (Optional)
              </label>
              <input
                type="text"
                value={formData.valuation}
                onChange={(e) => updateField('valuation', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                placeholder="$10,000,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Use of Funds
              </label>
              <textarea
                value={formData.useOfFunds}
                onChange={(e) => updateField('useOfFunds', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
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
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                    placeholder="Create a password"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Pitch Deck</h3>
              <p className="text-gray-400 text-sm mb-4">
                Upload your pitch deck (PDF) - You can also add this later from your dashboard.
              </p>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPitchDeck(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pitch-deck-upload"
                />
                <label
                  htmlFor="pitch-deck-upload"
                  className="cursor-pointer text-blue-400 hover:text-blue-300"
                >
                  {pitchDeck ? pitchDeck.name : 'Click to upload PDF'}
                </label>
                {pitchDeck && (
                  <button
                    onClick={() => setPitchDeck(null)}
                    className="ml-3 text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
                <p className="text-gray-500 text-sm mt-2">PDF up to 10MB</p>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <label className="flex items-start text-gray-300">
                <input type="checkbox" className="mt-1 mr-3" required />
                <span>
                  I agree to the Terms of Service and Privacy Policy. I confirm that
                  all information provided is accurate.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            &larr; Back to Home
          </Link>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Apply as a Startup
          </h1>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? 'bg-blue-600 text-white'
                      : index === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">{renderStep()}</div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
