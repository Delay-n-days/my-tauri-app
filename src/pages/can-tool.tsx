import { useState, useEffect, useRef } from "react";
import { useAppTranslation } from "@/hooks/use-app-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CanService, CanMessage } from "@/services/can-service";
import { Toaster } from "@/components/ui/sonner";

export default function CanTool() {
  const { t } = useAppTranslation();
  const [canService] = useState(() => new CanService());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Device config state
  const [channel, setChannel] = useState<string>("0");
  const [baudrate, setBaudrate] = useState<string>("500");
  const [isConnected, setIsConnected] = useState(false);

  // Send message state
  const [canId, setCanId] = useState<string>("0x123");
  const [dataBytes, setDataBytes] = useState<string>("00 00 00 00 00 00 00 00");

  // Receive message state
  const [messages, setMessages] = useState<CanMessage[]>([]);
  const [autoReceive, setAutoReceive] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-receive polling
  useEffect(() => {
    if (!autoReceive || !isConnected) return;

    const interval = setInterval(async () => {
      try {
        const newMessages = await canService.receive(100);
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages].slice(-100)); // Keep last 100
        }
      } catch (err) {
        console.error("Receive error:", err);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [autoReceive, isConnected, canService]);

  const handleInit = async () => {
    try {
      const channelNum = parseInt(channel);
      const baudrateNum = parseInt(baudrate);
      await canService.init(channelNum, baudrateNum);
      setIsConnected(true);
      toast.success(t("can.initSuccess"));
    } catch (err) {
      toast.error(t("can.initFailed", { error: String(err) }));
    }
  };

  const handleClose = async () => {
    try {
      await canService.close();
      setIsConnected(false);
      setAutoReceive(false);
      toast.success(t("can.closeSuccess"));
    } catch (err) {
      toast.error(t("can.closeFailed", { error: String(err) }));
    }
  };

  const handleSend = async () => {
    try {
      const id = parseInt(canId.startsWith("0x") ? canId : `0x${canId}`, 16);
      const data = dataBytes
        .split(/\s+/)
        .filter((b) => b.length > 0)
        .map((b) => parseInt(b, 16));

      if (data.length !== 8) {
        throw new Error(t("can.dataMustBe8Bytes"));
      }

      if (data.some((b) => isNaN(b) || b < 0 || b > 255)) {
        throw new Error(t("can.invalidByteValue"));
      }

      await canService.send(id, data);
      toast.success(t("can.sendSuccess"));
    } catch (err) {
      toast.error(t("can.sendFailed", { error: String(err) }));
    }
  };

  const formatTimestamp = (ts: number) => {
    const minutes = Math.floor(ts / 60000);
    const seconds = Math.floor((ts % 60000) / 1000);
    const micros = Math.floor((ts % 1000) * 10); // Convert ms to 0.1ms (4 digits)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${micros.toString().padStart(4, "0")}`;
  };

  return (
    <div className="flex-1 overflow-auto p-8">
      <Toaster />

      <div className="space-y-4 max-w-[920px]">
        <h1 className="text-2xl font-semibold">{t("can.title")}</h1>

        {/* Device Config */}
        <Card>
          <CardHeader>
            <CardTitle>{t("can.deviceConfig")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">
                  {t("can.channel")}
                </label>
                <Input
                  type="number"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  disabled={isConnected}
                  min="0"
                  max="3"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">
                  {t("can.baudrate")}
                </label>
                <Select
                  value={baudrate}
                  onValueChange={setBaudrate}
                  disabled={isConnected}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500K</SelectItem>
                    <SelectItem value="250">250K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={isConnected ? "default" : "secondary"}>
                  ●
                </Badge>
                <span className="text-muted-foreground">
                  {isConnected ? t("can.connected") : t("can.disconnected")}
                </span>
              </div>
              <Button
                onClick={isConnected ? handleClose : handleInit}
                disabled={!channel || !baudrate}
              >
                {isConnected ? t("can.close") : t("can.open")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Send Message */}
        <Card>
          <CardHeader>
            <CardTitle>{t("can.sendMessage")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 items-end">
              <div className="w-[200px] space-y-2">
                <label className="text-sm font-medium">{t("can.canId")}</label>
                <Input
                  value={canId}
                  onChange={(e) => setCanId(e.target.value)}
                  placeholder="0x123"
                  disabled={!isConnected}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">
                  {t("can.data")}
                </label>
                <Input
                  value={dataBytes}
                  onChange={(e) => setDataBytes(e.target.value)}
                  placeholder="00 00 00 00 00 00 00 00"
                  disabled={!isConnected}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={!isConnected}>
                {t("can.send")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receive Messages */}
        <Card className="h-[380px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("can.receiveMessages")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={autoReceive ? "default" : "secondary"}
                  onClick={() => setAutoReceive(!autoReceive)}
                  disabled={!isConnected}
                >
                  {autoReceive
                    ? t("can.stopReceiving")
                    : t("can.startReceiving")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMessages([])}
                  disabled={!isConnected}
                >
                  {t("can.clear")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto bg-muted rounded-md p-3 font-mono text-xs space-y-0.5">
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  {t("can.noMessages")}
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className="hover:bg-background px-1.5 py-1">
                      <span className="text-muted-foreground">
                        {formatTimestamp(msg.timestamp)}
                      </span>{" "}
                      <span className="text-primary font-semibold">
                        0x{msg.id.toString(16).toUpperCase().padStart(3, "0")}
                      </span>{" "}
                      <span>
                        [
                        {msg.data
                          .map((b) =>
                            b.toString(16).toUpperCase().padStart(2, "0"),
                          )
                          .join(" ")}
                        ]
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
