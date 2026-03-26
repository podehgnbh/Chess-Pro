/**
 * GameSettings Component - مكون إعدادات اللعبة
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { THEME } from '@/lib/constants';
import { soundManager } from '@/lib/sound-manager';

interface GameSettingsProps {
  onClose?: () => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({ onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isSoundEnabled());
  const [boardTheme, setBoardTheme] = useState<'classic' | 'modern' | 'elegant'>('classic');
  const [showCoordinates, setShowCoordinates] = useState(true);

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.toggleSound(newState);
  };

  return (
    <Card
      className="p-6 space-y-6"
      style={{
        backgroundColor: THEME.primary,
        borderColor: THEME.secondary,
      }}
    >
      <h2 className="text-2xl font-bold" style={{ color: THEME.secondary }}>
        إعدادات اللعبة
      </h2>

      {/* Sound Settings */}
      <div className="space-y-3">
        <h3 className="font-bold" style={{ color: THEME.secondary }}>
          الصوت
        </h3>
        <div
          className="p-4 rounded flex justify-between items-center"
          style={{
            backgroundColor: THEME.background,
          }}
        >
          <span>تفعيل الأصوات</span>
          <Button
            onClick={handleSoundToggle}
            style={{
              backgroundColor: soundEnabled ? THEME.secondary : THEME.border,
              color: soundEnabled ? THEME.primary : THEME.text,
            }}
          >
            {soundEnabled ? 'مفعّل' : 'معطّل'}
          </Button>
        </div>
      </div>

      {/* Board Theme */}
      <div className="space-y-3">
        <h3 className="font-bold" style={{ color: THEME.secondary }}>
          مظهر اللوحة
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['classic', 'modern', 'elegant'] as const).map((theme) => (
            <Button
              key={theme}
              onClick={() => setBoardTheme(theme)}
              className={`text-sm ${boardTheme === theme ? 'opacity-100' : 'opacity-50'}`}
              style={{
                backgroundColor: boardTheme === theme ? THEME.secondary : THEME.border,
                color: boardTheme === theme ? THEME.primary : THEME.text,
              }}
            >
              {theme === 'classic' ? 'كلاسيكي' : theme === 'modern' ? 'حديث' : 'أنيق'}
            </Button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <h3 className="font-bold" style={{ color: THEME.secondary }}>
          خيارات العرض
        </h3>
        <div
          className="p-4 rounded flex justify-between items-center"
          style={{
            backgroundColor: THEME.background,
          }}
        >
          <span>إظهار الإحداثيات</span>
          <Button
            onClick={() => setShowCoordinates(!showCoordinates)}
            style={{
              backgroundColor: showCoordinates ? THEME.secondary : THEME.border,
              color: showCoordinates ? THEME.primary : THEME.text,
            }}
          >
            {showCoordinates ? 'مفعّل' : 'معطّل'}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 rounded text-sm text-center"
        style={{
          backgroundColor: THEME.background,
          color: THEME.textSecondary,
        }}
      >
        <p>© عبد الله مصطفى - Abdullah Mustafa</p>
        <p>لعبة الشطرنج الاحترافية v1.0</p>
      </div>

      {onClose && (
        <Button
          onClick={onClose}
          className="w-full"
          style={{
            backgroundColor: THEME.secondary,
            color: THEME.primary,
          }}
        >
          إغلاق
        </Button>
      )}
    </Card>
  );
};
