import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  DollarSign,
  Gauge,
  Package,
  Settings,
} from 'lucide-react'
import type { AIModel, RecommendationRequest, RecommendationResult, ModelCategory, Modality } from '../types'
import { recommendModels } from '../utils/recommendationEngine'

interface RecommendationWizardProps {
  models: AIModel[]
  onResultsReady: (results: RecommendationResult[]) => void
}

type Step = 1 | 2 | 3 | 4 | 5

const STEPS: Step[] = [1, 2, 3, 4, 5]

export default function RecommendationWizard({ models, onResultsReady }: RecommendationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [request, setRequest] = useState<RecommendationRequest>({
    useCase: 'chat',
    performanceLevel: 'balanced',
    speedRequired: 'moderate',
    modalitiesNeeded: ['text'],
    licensePreference: 'any',
    budgetRange: 'medium',
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step)
    } else {
      // Finish - generate recommendations
      const results = recommendModels(models, request)
      onResultsReady(results)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const stepHeaders = [
    { num: 1, title: 'Use Case', icon: <Zap size={20} /> },
    { num: 2, title: 'Performance', icon: <Gauge size={20} /> },
    { num: 3, title: 'Requirements', icon: <Settings size={20} /> },
    { num: 4, title: 'Budget', icon: <DollarSign size={20} /> },
    { num: 5, title: 'Results', icon: <Package size={20} /> },
  ]

  return (
    <div className="wizard-container">
      {/* Progress indicator */}
      <div className="wizard-progress">
        <div className="progress-steps">
          {STEPS.map((step) => (
            <div key={step} className="progress-step-group">
              <div
                className={`progress-step ${step === currentStep ? 'active' : ''} ${
                  step < currentStep ? 'completed' : ''
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              <div className="progress-label">{stepHeaders[step - 1].title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="wizard-step"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && <Step1 request={request} setRequest={setRequest} />}
          {currentStep === 2 && <Step2 request={request} setRequest={setRequest} />}
          {currentStep === 3 && <Step3 request={request} setRequest={setRequest} />}
          {currentStep === 4 && <Step4 request={request} setRequest={setRequest} />}
          {currentStep === 5 && <Step5 request={request} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="wizard-footer">
        <button
          className="wizard-btn wizard-btn-secondary"
          onClick={handlePrev}
          disabled={currentStep === 1}
          aria-label="Previous step"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          className="wizard-btn wizard-btn-primary"
          onClick={handleNext}
          aria-label={currentStep === 5 ? 'See recommendations' : 'Next step'}
        >
          {currentStep === 5 ? 'See Recommendations' : 'Next'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function Step1({
  request,
  setRequest,
}: {
  request: RecommendationRequest
  setRequest: (r: RecommendationRequest) => void
}) {
  const useCases: Array<{ value: ModelCategory | 'custom'; label: string; description: string }> = [
    { value: 'chat', label: 'Chat Assistant', description: 'Conversational AI and chatbots' },
    { value: 'code', label: 'Code Generation', description: 'Programming and coding tasks' },
    { value: 'vision', label: 'Vision & Images', description: 'Image understanding and analysis' },
    { value: 'reasoning', label: 'Reasoning', description: 'Complex problem solving' },
    { value: 'embedding', label: 'Embeddings', description: 'Vector embeddings for RAG' },
    { value: 'audio', label: 'Audio Processing', description: 'Speech and audio tasks' },
    { value: 'custom', label: 'Custom Use Case', description: 'Something else' },
  ]

  return (
    <div className="wizard-step-content">
      <h2 className="wizard-step-title">What's your primary use case?</h2>
      <p className="wizard-step-description">Choose the type of task you'll primarily use the model for.</p>

      <div className="wizard-options">
        {useCases.map((useCase) => (
          <button
            key={useCase.value}
            className={`wizard-option ${request.useCase === useCase.value ? 'selected' : ''}`}
            onClick={() => setRequest({ ...request, useCase: useCase.value })}
          >
            <div className="option-label">{useCase.label}</div>
            <div className="option-description">{useCase.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step2({
  request,
  setRequest,
}: {
  request: RecommendationRequest
  setRequest: (r: RecommendationRequest) => void
}) {
  const levels = [
    {
      value: 'cost-optimized' as const,
      label: 'Cost-Optimized',
      description: 'Prioritize affordability, accept lower performance',
      emoji: '💰',
    },
    {
      value: 'balanced' as const,
      label: 'Balanced',
      description: 'Good mix of performance and cost',
      emoji: '⚖️',
    },
    {
      value: 'high-performance' as const,
      label: 'Maximum Performance',
      description: 'Prioritize capability, cost is secondary',
      emoji: '🚀',
    },
  ]

  return (
    <div className="wizard-step-content">
      <h2 className="wizard-step-title">How important is performance vs. cost?</h2>
      <p className="wizard-step-description">Select the performance tier that best matches your priorities.</p>

      <div className="wizard-options wizard-options-grid">
        {levels.map((level) => (
          <button
            key={level.value}
            className={`wizard-option wizard-option-large ${
              request.performanceLevel === level.value ? 'selected' : ''
            }`}
            onClick={() => setRequest({ ...request, performanceLevel: level.value })}
          >
            <div className="option-emoji">{level.emoji}</div>
            <div className="option-label">{level.label}</div>
            <div className="option-description">{level.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step3({
  request,
  setRequest,
}: {
  request: RecommendationRequest
  setRequest: (r: RecommendationRequest) => void
}) {
  const speedOptions = [
    {
      value: 'flexible' as const,
      label: 'Response time is flexible',
    },
    {
      value: 'moderate' as const,
      label: 'Moderate speed (seconds)',
    },
    {
      value: 'critical' as const,
      label: 'Must be fast (milliseconds)',
    },
  ]

  const modalityOptions = [
    { value: 'text' as const, label: 'Text' },
    { value: 'image' as const, label: 'Images' },
    { value: 'audio' as const, label: 'Audio' },
    { value: 'code' as const, label: 'Code' },
  ]

  const toggleModality = (modality: Modality) => {
    const updated = request.modalitiesNeeded.includes(modality)
      ? request.modalitiesNeeded.filter((m) => m !== modality)
      : [...request.modalitiesNeeded, modality]
    setRequest({ ...request, modalitiesNeeded: updated })
  }

  return (
    <div className="wizard-step-content">
      <h2 className="wizard-step-title">Technical Requirements</h2>

      <div className="wizard-section">
        <h3 className="wizard-section-title">How fast does it need to be?</h3>
        <div className="wizard-options">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              className={`wizard-option ${request.speedRequired === option.value ? 'selected' : ''}`}
              onClick={() => setRequest({ ...request, speedRequired: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section-title">Input types you'll need:</h3>
        <div className="wizard-chips">
          {modalityOptions.map((modality) => (
            <button
              key={modality.value}
              className={`wizard-chip ${
                request.modalitiesNeeded.includes(modality.value) ? 'selected' : ''
              }`}
              onClick={() => toggleModality(modality.value)}
            >
              {modality.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step4({
  request,
  setRequest,
}: {
  request: RecommendationRequest
  setRequest: (r: RecommendationRequest) => void
}) {
  const budgets = [
    { value: 'free' as const, label: 'Free only', range: '$0' },
    { value: 'low' as const, label: 'Low budget', range: '<$100/mo' },
    { value: 'medium' as const, label: 'Medium budget', range: '$100-500/mo' },
    { value: 'high' as const, label: 'High budget', range: '$500-2000/mo' },
    { value: 'premium' as const, label: 'No budget limit', range: '$2000+/mo' },
  ]

  return (
    <div className="wizard-step-content">
      <h2 className="wizard-step-title">What's your monthly budget?</h2>
      <p className="wizard-step-description">This helps us recommend models that fit your budget constraints.</p>

      <div className="wizard-options">
        {budgets.map((budget) => (
          <button
            key={budget.value}
            className={`wizard-option wizard-option-budget ${
              request.budgetRange === budget.value ? 'selected' : ''
            }`}
            onClick={() => setRequest({ ...request, budgetRange: budget.value })}
          >
            <div className="option-label">{budget.label}</div>
            <div className="option-range">{budget.range}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step5({ request }: { request: RecommendationRequest }) {
  return (
    <div className="wizard-step-content">
      <h2 className="wizard-step-title">Ready to find your model?</h2>
      <p className="wizard-step-description">Here's a summary of your preferences:</p>

      <div className="wizard-summary">
        <div className="summary-item">
          <span className="summary-label">Use Case:</span>
          <span className="summary-value">{request.useCase}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Performance Level:</span>
          <span className="summary-value">{request.performanceLevel}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Speed Requirement:</span>
          <span className="summary-value">{request.speedRequired}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Input Types:</span>
          <span className="summary-value">{request.modalitiesNeeded.join(', ')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Budget Range:</span>
          <span className="summary-value">{request.budgetRange}</span>
        </div>
      </div>
    </div>
  )
}
