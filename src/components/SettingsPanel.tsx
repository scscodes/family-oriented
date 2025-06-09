"use client";

import React, { useState, useEffect } from "react";
import { GameSettings, DEFAULT_SETTINGS, getSettings, saveSettings } from "@/utils/settingsUtils";
import { GameType } from "@/utils/gameUtils";

interface SettingsPanelProps {
  gameType: GameType;
  onSettingsChange: (settings: GameSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings panel component for configuring game parameters
 */
export default function SettingsPanel({ 
  gameType, 
  onSettingsChange, 
  isOpen, 
  onClose 
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS[gameType]);
  const [showNumberRange, setShowNumberRange] = useState(gameType === 'numbers');
  
  // Load settings when component mounts or gameType changes
  useEffect(() => {
    const loadedSettings = getSettings(gameType);
    setSettings(loadedSettings);
    setShowNumberRange(gameType === 'numbers');
  }, [gameType]);
  
  const handleChange = (field: string, value: number | { min: number; max: number }) => {
    const updatedSettings = { ...settings };
    
    if (field === 'numberRange') {
      updatedSettings.numberRange = value as { min: number; max: number };
    } else if (field === 'questionCount') {
      updatedSettings.questionCount = value as number;
    } else if (field === 'optionsCount') {
      updatedSettings.optionsCount = value as number;
    }
    
    setSettings(updatedSettings);
  };
  
  const handleSave = () => {
    saveSettings(gameType, settings);
    onSettingsChange(settings);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div>
      <div>
        <div>
          <h2>Game Settings</h2>
          <button onClick={onClose}>Close</button>
        </div>
        
        <div>
          {/* Number Range Settings */}
          {showNumberRange && (
            <div>
              <label>Number Range</label>
              <div>
                <div>
                  <label>Min</label>
                  <input 
                    type="number" 
                    value={settings.numberRange.min}
                    onChange={(e) => handleChange('numberRange', {
                      ...settings.numberRange,
                      min: Math.max(1, parseInt(e.target.value) || 1)
                    })}
                    min="1"
                  />
                </div>
                <div>
                  <label>Max</label>
                  <input 
                    type="number" 
                    value={settings.numberRange.max}
                    onChange={(e) => handleChange('numberRange', {
                      ...settings.numberRange,
                      max: Math.max(settings.numberRange.min, parseInt(e.target.value) || settings.numberRange.min)
                    })}
                    min={settings.numberRange.min}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Question Count Setting */}
          <div>
            <label>Number of Questions</label>
            <input 
              type="number" 
              value={settings.questionCount}
              onChange={(e) => handleChange('questionCount', Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="50"
            />
          </div>
          
          {/* Options Count Setting */}
          <div>
            <label>Number of Answer Choices</label>
            <input 
              type="number" 
              value={settings.optionsCount}
              onChange={(e) => handleChange('optionsCount', Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
              min="2"
              max="6"
            />
            <p>Min: 2, Max: 6 answer choices</p>
          </div>
        </div>
        
        <div>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
} 