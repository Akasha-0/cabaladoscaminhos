'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress, ProgressIndicator } from '@/components/ui/progress';
import { Sparkles, User, Calendar, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const TOTAL_STEPS = 4;

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

interface FormData {
  fullName: string;
  birthDate: string;
  birthTime: string;
  city: string;
  state: string;
  country: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: '',
    birthTime: '',
    city: '',
    state: '',
    country: 'Brasil',
  });

  const progressValue = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/mapa');
      } else {
        console.error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return (
          formData.birthDate &&
          formData.birthTime &&
          formData.city.trim().length > 0 &&
          formData.state &&
          formData.country
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderWelcomeStep = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
      <div className="rounded-full bg-amber-500/20 p-6">
        <Sparkles className="h-16 w-16 text-amber-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Bem-vindo à Cabala dos Caminhos
        </h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Prepare-se para uma jornada de autoconhecimento e descoberta espiritual.
          Vamos coletar algumas informações para criar o seu Mapa da Alma personalizado.
        </p>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-amber-500" />
          Dados protegidos e seguros
        </p>
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-amber-500" />
          Cálculos baseados em princípios cabalísticos
        </p>
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-amber-500" />
          Resultado personalizado para você
        </p>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <User className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Suas Informações</h2>
        </div>
        <p className="text-muted-foreground">
          Como podemos te chamar durante essa jornada?
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-foreground">
          Nome Completo
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Digite seu nome completo"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-foreground placeholder:text-slate-500"
        />
      </div>
    </div>
  );

  const renderBirthDataStep = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Dados de Nascimento</h2>
        </div>
        <p className="text-muted-foreground">
          These information are essential for calculating your spiritual map.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-foreground">
            Data de Nascimento
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthTime" className="text-foreground">
            Hora do Nascimento
          </Label>
          <Input
            id="birthTime"
            type="time"
            value={formData.birthTime}
            onChange={(e) => handleInputChange('birthTime', e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city" className="text-foreground">
          Cidade de Nascimento
        </Label>
        <Input
          id="city"
          type="text"
          placeholder="Digite a cidade"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="bg-slate-800/50 border-slate-700 text-foreground placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state" className="text-foreground">
            Estado
          </Label>
          <Select
            value={formData.state}
            onValueChange={(value) => handleInputChange('state', value)}
          >
            <SelectTrigger
              id="state"
              className="bg-slate-800/50 border-slate-700 text-foreground"
            >
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {BRAZILIAN_STATES.map((state) => (
                <SelectItem
                  key={state.value}
                  value={state.value}
                  className="text-foreground focus:bg-slate-700 focus:text-foreground"
                >
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-foreground">
            País
          </Label>
          <Select
            value={formData.country}
            onValueChange={(value) => handleInputChange('country', value)}
          >
            <SelectTrigger
              id="country"
              className="bg-slate-800/50 border-slate-700 text-foreground"
            >
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem
                value="Brasil"
                className="text-foreground focus:bg-slate-700 focus:text-foreground"
              >
                Brasil
              </SelectItem>
              <SelectItem
                value="Portugal"
                className="text-foreground focus:bg-slate-700 focus:text-foreground"
              >
                Portugal
              </SelectItem>
              <SelectItem
                value="Argentina"
                className="text-foreground focus:bg-slate-700 focus:text-foreground"
              >
                Argentina
              </SelectItem>
              <SelectItem
                value="Estados Unidos"
                className="text-foreground focus:bg-slate-700 focus:text-foreground"
              >
                Estados Unidos
              </SelectItem>
              <SelectItem
                value="Espanha"
                className="text-foreground focus:bg-slate-700 focus:text-foreground"
              >
                Espanha
              </SelectItem>
              <SelectItem
                value="Outro"
                className="text-foreground focus:bg-slate-700 focus:text-foreground"
              >
                Outro
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <CheckCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Confirmação</h2>
        </div>
        <p className="text-muted-foreground">
          Revise suas informações antes de gerar o seu Mapa da Alma.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Nome</p>
          <p className="text-lg font-medium text-foreground">{formData.fullName || '-'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            <p className="text-foreground">{formData.birthDate || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Hora do Nascimento</p>
            <p className="text-foreground">{formData.birthTime || '-'}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Local de Nascimento</p>
          <p className="text-foreground">
            {formData.city
              ? `${formData.city}, ${formData.state || ''}, ${formData.country}`
              : '-'}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-center">
        <p className="text-amber-400 font-medium">
          Gere seu Mapa da Alma
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Após confirmar, seu mapa personalizado será calculado
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderBirthDataStep();
      case 3:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const stepLabels = ['Bem-vindo', 'Informações', 'Nascimento', 'Confirmar'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Cabala dos Caminhos
          </h1>
          <p className="text-muted-foreground">
            {stepLabels[currentStep]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressValue} className="h-2">
            <ProgressIndicator
              className="bg-amber-500"
              style={{ width: `${progressValue}%` }}
            />
          </Progress>
          <div className="flex justify-between text-xs text-muted-foreground">
            {stepLabels.map((label, index) => (
              <span
                key={index}
                className={index <= currentStep ? 'text-amber-500' : ''}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <Card className="bg-slate-800/50 border-slate-700 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-center">
              {currentStep === 0 && 'Iniciar Jornada'}
              {currentStep === 1 && 'Suas Informações'}
              {currentStep === 2 && 'Dados de Nascimento'}
              {currentStep === 3 && 'Revisar & Confirmar'}
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Passo {currentStep + 1} de {TOTAL_STEPS}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          {currentStep > 0 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-slate-700 bg-slate-800/50 text-foreground hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
            >
              {isSubmitting ? 'Gerando...' : 'Gerar Mapa da Alma'}
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
