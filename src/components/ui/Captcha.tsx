import { useTranslation } from '../../i18n';
import { useState, useEffect } from 'react';

interface CaptchaProps {
  onValidate: (valid: boolean) => void;
}

function generateCaptcha(): { a: number; b: number; op: string; answer: number } {
  const ops = ['+', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = Math.floor(Math.random() * 9) + 1;
  const b = op === '*' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 9) + 1;
  const answer = op === '+' ? a + b : a * b;
  return { a, b, op, answer };
}

export default function Captcha({ onValidate }: CaptchaProps) {
  const { t } = useTranslation();
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [input, setInput] = useState('');

  useEffect(() => {
    onValidate(input === captcha.answer.toString());
  }, [input, captcha, onValidate]);

  const refresh = () => {
    setCaptcha(generateCaptcha());
    setInput('');
    onValidate(false);
  };

  return (
    <div>
      <label className="label">{t('captcha.label')}</label>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary-100 rounded-lg font-mono text-lg font-bold text-secondary-700 select-none">
          <span>{captcha.a}</span>
          <span>{captcha.op}</span>
          <span>{captcha.b}</span>
          <span>=</span>
          <span>?</span>
        </div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
          className="input w-20 text-center font-mono text-lg"
          placeholder="?"
          maxLength={2}
        />
        <button type="button" onClick={refresh} className="p-2 text-secondary-400 hover:text-primary-600 transition-colors" title="New code">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
