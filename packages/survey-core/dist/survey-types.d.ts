export type QuestionType = 'text' | 'email' | 'phone' | 'number' | 'yesno' | 'single' | 'multi' | 'group' | 'repeatable';
export interface BaseQuestion {
    id: string;
    type: QuestionType;
    label: string;
    required?: boolean;
    showIf?: Record<string, any>;
}
export interface TextQuestion extends BaseQuestion {
    type: 'text' | 'email' | 'phone';
}
export interface NumberQuestion extends BaseQuestion {
    type: 'number';
}
export interface YesNoQuestion extends BaseQuestion {
    type: 'yesno';
}
export interface SingleSelectQuestion extends BaseQuestion {
    type: 'single';
    options: string[];
}
export interface MultiSelectQuestion extends BaseQuestion {
    type: 'multi';
    options: string[];
}
export interface GroupQuestion extends BaseQuestion {
    type: 'group';
    fields: Question[];
}
export interface RepeatableQuestion extends BaseQuestion {
    type: 'repeatable';
    fields: Question[];
}
export type Question = TextQuestion | NumberQuestion | YesNoQuestion | SingleSelectQuestion | MultiSelectQuestion | GroupQuestion | RepeatableQuestion;
export interface SurveyPage {
    id: string;
    title: string;
    questions: Question[];
}
export interface SurveySession {
    id: string;
    current_page: number;
    edit_mode: 'customer_editable' | 'agent_only';
}
export interface SurveyResponse {
    session_id: string;
    question_id: string;
    value: any;
}
