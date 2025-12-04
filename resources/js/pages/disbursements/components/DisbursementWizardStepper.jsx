import { Check, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DisbursementWizardStepper({ currentStep, steps }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isUpcoming = stepNumber > currentStep;

                    return (
                        <div key={stepNumber} className="flex flex-1 items-center">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                                        isCompleted && 'border-green-500 bg-green-500 text-white',
                                        isCurrent && 'border-blue-500 bg-blue-500 text-white ring-4 ring-blue-100',
                                        isUpcoming && 'border-slate-300 bg-white text-slate-400'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{stepNumber}</span>
                                    )}
                                </div>
                                <div className="mt-2 hidden text-center md:block">
                                    <div
                                        className={cn(
                                            'text-sm font-medium',
                                            isCurrent && 'text-blue-600',
                                            isCompleted && 'text-green-600',
                                            isUpcoming && 'text-slate-400'
                                        )}
                                    >
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-slate-500">{step.description}</div>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'mx-2 h-0.5 flex-1 transition-all duration-200',
                                        stepNumber < currentStep ? 'bg-green-500' : 'bg-slate-200'
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Step Indicator */}
            <div className="mt-4 block text-center md:hidden">
                <div className="text-sm font-medium text-blue-600">
                    {steps[currentStep - 1]?.title}
                </div>
                <div className="text-xs text-slate-500">
                    Step {currentStep} of {steps.length}
                </div>
            </div>
        </div>
    );
}
