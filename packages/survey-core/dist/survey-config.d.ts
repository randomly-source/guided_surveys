export declare const surveyPages: ({
    id: string;
    title: string;
    questions: ({
        id: string;
        type: string;
        label: string;
        required: boolean;
    } | {
        id: string;
        type: string;
        label: string;
        required?: undefined;
    })[];
} | {
    id: string;
    title: string;
    questions: ({
        id: string;
        type: string;
        label: string;
        showIf?: undefined;
    } | {
        id: string;
        type: string;
        label: string;
        showIf: {
            watch_tv: string;
        };
    })[];
} | {
    id: string;
    title: string;
    questions: {
        id: string;
        type: string;
        label: string;
        options: string[];
    }[];
} | {
    id: string;
    title: string;
    questions: {
        id: string;
        type: string;
        label: string;
        fields: ({
            id: string;
            type: string;
            label: string;
            options?: undefined;
        } | {
            id: string;
            type: string;
            label: string;
            options: string[];
        })[];
    }[];
})[];
