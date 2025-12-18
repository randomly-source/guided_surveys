export declare function updateSessionPage(sessionId: string, pageIndex: number): Promise<void>;
export declare function updateSessionEditMode(sessionId: string, editMode: 'customer_editable' | 'agent_only'): Promise<void>;
export declare function upsertResponse(sessionId: string, questionId: string, value: any): Promise<void>;
export declare function createSession(sessionId: string): Promise<void>;
