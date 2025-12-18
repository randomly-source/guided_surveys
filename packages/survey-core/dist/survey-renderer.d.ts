import { Question } from './survey-types';
interface SurveyRendererProps {
    question: Question;
    value: any;
    onChange: (value: any) => void;
    disabled?: boolean;
}
export declare function SurveyRenderer({ question, value, onChange, disabled }: SurveyRendererProps): import("react/jsx-runtime").JSX.Element;
export {};
