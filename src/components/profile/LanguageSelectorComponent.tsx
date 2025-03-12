import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MenuItem, Select } from "@mui/material";
import i18n from "@/locales/i18n";

interface LanguageSelectorComponentProps {
    onChangeLanguage: (language: string) => void;
}

const LanguageSelectorComponent: React.FC<LanguageSelectorComponentProps> = ({ onChangeLanguage }) => {
    return (
        <Select
            value={i18n.language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ minWidth: 120 }}
        >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fi">Suomi</MenuItem>
        </Select>
    );
};

export default LanguageSelectorComponent;
