import { render } from "@testing-library/react";
import { RealtimeAlerts } from "./RealtimeAlerts";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";

// Mock sonner
vi.mock("sonner", () => {
  const mockToast = vi.fn();
  // @ts-expect-error adding property to function
  mockToast.error = vi.fn();
  return { toast: mockToast };
});

describe("RealtimeAlerts", () => {
  let mockWebSocket: {
    send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
    close: (code?: number, reason?: string) => void;
    onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null;
    onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null;
    onerror: ((this: WebSocket, ev: Event) => unknown) | null;
  };

  beforeEach(() => {
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      onmessage: null,
      onclose: null,
      onerror: null,
    };
    // @ts-expect-error WebSocket is a constructor
    global.WebSocket = vi.fn(function () {
      return mockWebSocket;
    });
  });


  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should connect to the websocket on mount", () => {
    render(<RealtimeAlerts />);
    expect(global.WebSocket).toHaveBeenCalledWith("wss://ws.tzevaadom.co.il/socket?platform=WEB");
  });

  it("should handle ALERT messages and show a toast", () => {
    render(<RealtimeAlerts />);
    
    const alertData = {
      type: "ALERT",
      data: {
        cities: ["אשקלון"],
        threat: 0,
        isDrill: false,
      },
    };

    if (mockWebSocket.onmessage) {
      mockWebSocket.onmessage.call(
        mockWebSocket as unknown as WebSocket,
        new MessageEvent("message", { data: JSON.stringify(alertData) }),
      );
    }

    expect(toast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 15000,
      }),
    );
  });
});
