import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Globe, Moon, Sun, Bell, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Settings: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const settingSections = [
    {
      title: dir === 'rtl' ? 'إعدادات العرض' : 'Display Settings',
      icon: Globe,
      settings: [
        {
          id: 'language',
          label: dir === 'rtl' ? 'اللغة' : 'Language',
          description: dir === 'rtl' ? 'اختر لغة الواجهة' : 'Choose interface language',
          type: 'buttons' as const,
          options: [
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' },
          ],
          currentValue: language,
          onChange: (value: string) => setLanguage(value as 'ar' | 'en'),
        },
        {
          id: 'theme',
          label: dir === 'rtl' ? 'المظهر' : 'Theme',
          description: dir === 'rtl' ? 'تبديل بين الوضع الفاتح والداكن' : 'Toggle between light and dark mode',
          type: 'toggle' as const,
          icon: theme === 'dark' ? Moon : Sun,
          currentValue: theme === 'dark',
          onChange: toggleTheme,
        },
      ],
    },
    {
      title: dir === 'rtl' ? 'الإشعارات' : 'Notifications',
      icon: Bell,
      settings: [
        {
          id: 'emailNotif',
          label: dir === 'rtl' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications',
          description: dir === 'rtl' ? 'استلام الإشعارات عبر البريد' : 'Receive notifications via email',
          type: 'toggle' as const,
          currentValue: true,
          onChange: () => {},
        },
        {
          id: 'smsNotif',
          label: dir === 'rtl' ? 'إشعارات الرسائل النصية' : 'SMS Notifications',
          description: dir === 'rtl' ? 'استلام الإشعارات عبر الرسائل' : 'Receive notifications via SMS',
          type: 'toggle' as const,
          currentValue: false,
          onChange: () => {},
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {dir === 'rtl' ? 'إدارة إعدادات التطبيق والتفضيلات' : 'Manage app settings and preferences'}
        </p>
      </div>

      {/* Settings Sections */}
      {settingSections.map((section) => (
        <div key={section.title} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <section.icon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold">{section.title}</h2>
          </div>

          <div className="divide-y divide-border">
            {section.settings.map((setting) => (
              <div key={setting.id} className="p-5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {setting.description}
                  </p>
                </div>

                {setting.type === 'toggle' && (
                  <div className="flex items-center gap-2">
                    {'icon' in setting && setting.icon && (
                      <setting.icon className="w-5 h-5 text-muted-foreground" />
                    )}
                    <Switch
                      id={setting.id}
                      checked={setting.currentValue as boolean}
                      onCheckedChange={setting.onChange}
                    />
                  </div>
                )}

                {setting.type === 'buttons' && (
                  <div className="flex gap-2">
                    {setting.options?.map((option) => (
                      <Button
                        key={option.value}
                        variant={setting.currentValue === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setting.onChange(option.value)}
                        className={setting.currentValue === option.value ? 'gradient-primary text-primary-foreground' : ''}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Company Settings */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold">
            {dir === 'rtl' ? 'بيانات الشركة' : 'Company Information'}
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="NASAYIM CLEAN" className="w-20 h-20 object-contain rounded-xl border" />
            <div>
              <h3 className="font-bold text-lg">{t('companyName')}</h3>
              <p className="text-muted-foreground text-sm">{t('companyDescription')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'اسم الشركة' : 'Company Name'}</Label>
              <Input defaultValue="NASAYIM CLEAN - نسائم كلين" />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input type="email" defaultValue="info@nasayimclean.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone'}</Label>
              <Input defaultValue="+966 11 123 4567" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{dir === 'rtl' ? 'المدينة' : 'City'}</Label>
              <Input defaultValue={dir === 'rtl' ? 'الرياض' : 'Riyadh'} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{dir === 'rtl' ? 'العنوان' : 'Address'}</Label>
              <Textarea defaultValue={dir === 'rtl' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'} />
            </div>
          </div>
          
          <Button className="gradient-primary text-white">
            {dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;