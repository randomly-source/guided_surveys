'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SurveyRenderer({ question, value, onChange, disabled }) {
    var _a, _b, _c;
    const handleChange = (newValue) => {
        onChange(newValue);
    };
    switch (question.type) {
        case 'text':
        case 'email':
        case 'phone':
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-1", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: question.type, value: value || '', onChange: (e) => handleChange(e.target.value), disabled: disabled, className: "w-full p-2 border rounded", required: question.required })] }));
        case 'number':
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-1", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "number", value: value || '', onChange: (e) => handleChange(Number(e.target.value)), disabled: disabled, className: "w-full p-2 border rounded", required: question.required })] }));
        case 'yesno':
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "space-x-4", children: [_jsxs("label", { children: [_jsx("input", { type: "radio", name: question.id, value: "yes", checked: value === 'yes', onChange: (e) => handleChange(e.target.value), disabled: disabled, className: "mr-1" }), "Yes"] }), _jsxs("label", { children: [_jsx("input", { type: "radio", name: question.id, value: "no", checked: value === 'no', onChange: (e) => handleChange(e.target.value), disabled: disabled, className: "mr-1" }), "No"] })] })] }));
        case 'single':
            const singleQuestion = question;
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { value: value || '', onChange: (e) => handleChange(e.target.value), disabled: disabled, className: "w-full p-2 border rounded", required: question.required, children: [_jsx("option", { value: "", children: "Select an option" }), (_a = singleQuestion.options) === null || _a === void 0 ? void 0 : _a.map((option) => (_jsx("option", { value: option, children: option }, option)))] })] }));
        case 'multi':
            const multiQuestion = question;
            const selectedValues = Array.isArray(value) ? value : [];
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "space-y-2", children: (_b = multiQuestion.options) === null || _b === void 0 ? void 0 : _b.map((option) => (_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: selectedValues.includes(option), onChange: (e) => {
                                        if (e.target.checked) {
                                            handleChange([...selectedValues, option]);
                                        }
                                        else {
                                            handleChange(selectedValues.filter((v) => v !== option));
                                        }
                                    }, disabled: disabled, className: "mr-2" }), option] }, option))) })] }));
        case 'group':
            const groupQuestion = question;
            const groupValue = value || {};
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "border p-4 rounded bg-gray-50", children: (_c = groupQuestion.fields) === null || _c === void 0 ? void 0 : _c.map((field) => (_jsx(SurveyRenderer, { question: Object.assign(Object.assign({}, field), { id: `${question.id}.${field.id}` }), value: groupValue[field.id], onChange: (fieldValue) => handleChange(Object.assign(Object.assign({}, groupValue), { [field.id]: fieldValue })), disabled: disabled }, field.id))) })] }));
        case 'repeatable':
            const repeatableQuestion = question;
            const repeatableValue = Array.isArray(value) ? value : [];
            return (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [question.label, question.required && _jsx("span", { className: "text-red-500", children: "*" })] }), repeatableValue.map((item, index) => {
                        var _a;
                        return (_jsxs("div", { className: "border p-4 rounded mb-2 bg-gray-50", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("span", { className: "font-medium", children: ["Item ", index + 1] }), _jsx("button", { type: "button", onClick: () => {
                                                const newValue = repeatableValue.filter((_, i) => i !== index);
                                                handleChange(newValue);
                                            }, disabled: disabled, className: "text-red-500 hover:text-red-700", children: "Remove" })] }), (_a = repeatableQuestion.fields) === null || _a === void 0 ? void 0 : _a.map((field) => (_jsx(SurveyRenderer, { question: Object.assign(Object.assign({}, field), { id: `${question.id}.${index}.${field.id}` }), value: item[field.id], onChange: (fieldValue) => {
                                        const newItem = Object.assign(Object.assign({}, item), { [field.id]: fieldValue });
                                        const newValue = [...repeatableValue];
                                        newValue[index] = newItem;
                                        handleChange(newValue);
                                    }, disabled: disabled }, field.id)))] }, index));
                    }), _jsxs("button", { type: "button", onClick: () => {
                            var _a;
                            const newItem = (_a = repeatableQuestion.fields) === null || _a === void 0 ? void 0 : _a.reduce((acc, field) => {
                                acc[field.id] = '';
                                return acc;
                            }, {});
                            handleChange([...repeatableValue, newItem]);
                        }, disabled: disabled, className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600", children: ["Add ", question.label] })] }));
        default:
            return (_jsx("div", { className: "mb-4", children: _jsxs("p", { children: ["Unsupported question type: ", question.type] }) }));
    }
}
