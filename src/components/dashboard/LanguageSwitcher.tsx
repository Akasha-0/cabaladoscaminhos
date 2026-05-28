"use client"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const toggle = () => {
    setLocale(locale === "pt-BR" ? "en" : "pt-BR")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {locale === "pt-BR" ? "PT" : "EN"}
    </Button>
  )
}