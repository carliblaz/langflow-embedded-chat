export function getChatPosition(
	triggerPosition: DOMRect,
	Cwidth:number,
	Cheight:number,
	position?: string,
): { top: string; left: string;
	position?: string, } {
	if (!triggerPosition) {
		return { top: "0px", left: "0px" }; // Return empty string if trigger position is not available
	}

	const { top, left, width, height } = triggerPosition;

	const distance = 5; // Adjust this value to set the desired distance from the trigger
	if(!position) return { top: distance + height+ "px", left: width + "px" };

	switch (position) {
		case "top-left":
			return { top: - distance - Cheight + "px", left: -Cwidth + "px" };
		case "top-center":
			return { top: - distance - Cheight + "px", left: width/2-Cwidth / 2 + "px" };
		case "top-right":
			return { top: - distance - Cheight + "px", left: width+ "px" };
		case "center-left":
			return { top: height/2-Cheight/2 + "px", left: -Cwidth - distance + "px" };
		case "center-right":
			return {
				top: height/2-Cheight/2 + "px",
				left: width + distance + "px",
			};
		case "bottom-right":
			return { top: distance + height+ "px", left: width + "px" };
		case "bottom-center":
			return {
				top: distance + height+ "px",
				left: width/2-Cwidth / 2 + "px",
			};
		case "bottom-left":
			return { top: distance + height+ "px", left: -Cwidth + "px"};
		default:
			return { top: distance + height+ "px", left: width + "px" };	
		}
}

export function getAnimationOrigin(position?:string) {
	if(!position) return "origin-top-left";
	switch (position) {
		case "top-left":
			return 'origin-bottom-right'
		case "top-center":
			return "origin-bottom";
		case "top-right":
			return "origin-bottom-left";
		case "center-left":
			return "origin-center";
		case "center-right":
			return "origin-center";
		case "bottom-right":
			return "origin-top-left";
		case "bottom-center":
			return "origin-top";
		case "bottom-left":
			return "origin-top-right"
		default:
			return "origin-top-left"
		}
}

export function extractMessageFromOutput(output:{type:string, message:any}){
	const {type, message} = output;
	if(type === "text") return message;
	if (type ==="message") return message.text;
	if(type==="object") return message.text;
	return "Unknown message structure"
}

/**
 * @param additional_headers - Headers as string (JSON), object, or undefined
 * @returns Parsed headers object, empty object {} if parsing fails, or undefined if input is undefined
 */
export function parseAdditionalHeaders(
	additional_headers?: { [key: string]: string } | string
): { [key: string]: string } | undefined {
	if (!additional_headers) return undefined;
	
	if (typeof additional_headers === 'string') {
		// Treat empty or whitespace-only strings as invalid
		if (additional_headers.trim() === '') {
			return {};
		}
		try {
			return JSON.parse(additional_headers);
		} catch (e) {
			console.error('Failed to parse additional_headers as JSON:', e, 'Value:', additional_headers);
			return {};
		}
	}
	
	// Already an object
	return additional_headers;
}
/**
 * Accepts a JSON array, a JSON string of an array, or a "|"-separated string
 * and returns a clean list of non-empty strings.
 */
export function parseStarterPrompts(value?: string[] | string): string[] {
	if (!value) return [];
	let list: unknown = value;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed === "") return [];
		try {
			list = JSON.parse(trimmed);
		} catch {
			list = trimmed.split("|");
		}
	}
	if (!Array.isArray(list)) return [];
	return list
		.map((item) => (typeof item === "string" ? item.trim() : ""))
		.filter((item) => item !== "");
}

function termsKey(flowId: string, version?: string) {
	return `langflow-chat:terms:${flowId}:${version || "1"}`;
}

/** Reads whether the visitor already accepted this version of the terms. */
export function readTermsAccepted(flowId: string, version?: string): boolean {
	try {
		return window.localStorage.getItem(termsKey(flowId, version)) !== null;
	} catch {
		return false; // storage blocked (privacy mode, sandboxed iframe, ...)
	}
}

/** Remembers the acceptance with a timestamp; silently ignores blocked storage. */
export function writeTermsAccepted(flowId: string, version?: string) {
	try {
		window.localStorage.setItem(termsKey(flowId, version), new Date().toISOString());
	} catch {
		/* ignore */
	}
}

// ---------- Chat history persistence ----------

export type PersistMode = "none" | "session" | "local";

export type StoredHistory = {
	sessionId: string;
	messages: { message: string; isSend: boolean; error?: boolean }[];
	open: boolean;
	updatedAt: number;
};

const MAX_STORED_MESSAGES = 100;

export function normalizePersistMode(value?: string): PersistMode {
	if (value === "session" || value === "local") return value;
	if (value === "true") return "session"; // persist_history="true" → per tab
	return "none";
}

function getStore(mode: PersistMode): Storage | null {
	if (mode === "none") return null;
	try {
		return mode === "local" ? window.localStorage : window.sessionStorage;
	} catch {
		return null; // storage blocked
	}
}

function historyKey(flowId: string) {
	return `langflow-chat:history:${flowId}`;
}

/**
 * Returns the saved conversation, or null when there is none, it is older than
 * ttlMinutes, it is unreadable, or it belongs to a different fixed session id.
 */
export function readHistory(
	mode: PersistMode,
	flowId: string,
	ttlMinutes?: number,
	fixedSessionId?: string
): StoredHistory | null {
	const store = getStore(mode);
	if (!store) return null;
	try {
		const raw = store.getItem(historyKey(flowId));
		if (!raw) return null;
		const data = JSON.parse(raw) as StoredHistory;
		if (!data || typeof data.sessionId !== "string" || !Array.isArray(data.messages)) return null;
		if (ttlMinutes && ttlMinutes > 0 && Date.now() - data.updatedAt > ttlMinutes * 60_000) {
			store.removeItem(historyKey(flowId));
			return null;
		}
		// The host page chose a session id (e.g. per logged-in user): only restore
		// history that belongs to it, so one user never sees another's chat.
		if (fixedSessionId && data.sessionId !== fixedSessionId) return null;
		return data;
	} catch {
		return null;
	}
}

export function writeHistory(
	mode: PersistMode,
	flowId: string,
	data: Omit<StoredHistory, "updatedAt">
) {
	const store = getStore(mode);
	if (!store) return;
	const payload: StoredHistory = {
		sessionId: data.sessionId,
		// keep only what is needed to redraw, and only the latest messages
		messages: data.messages
			.slice(-MAX_STORED_MESSAGES)
			.map(({ message, isSend, error }) => ({ message, isSend, ...(error ? { error } : {}) })),
		open: data.open,
		updatedAt: Date.now(),
	};
	try {
		store.setItem(historyKey(flowId), JSON.stringify(payload));
	} catch {
		/* quota exceeded or blocked: history just isn't saved */
	}
}
