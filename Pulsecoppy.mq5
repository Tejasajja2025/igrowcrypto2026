//+------------------------------------------------------------------+
//|                                              PulseCopyBridge.mq5 |
//|                             igrow Learning Society Self-Hosted    |
//+------------------------------------------------------------------+
#property copyright "igrow Learning Society"
#property link      "https://www.igrowlearningsociety.in"
#property version   "2.0"
#property strict

#include <Trade\Trade.mqh>

input string ApiUrl = "https://www.igrowlearningsociety.in/api/signals";
input string FollowerKey = "";
input int    RequestTimeoutMs = 5000;
input int    PollIntervalSec = 5;
input double OrderVolume = 0.01;
input int    OrderDeviation = 20;
input bool   StrictTPValidation = false;  // Set to false for brokers with restricted pricing

string lastProcessedSignal = "";
long bridgeStartTime = 0;
long lastSignalTime = 0;  // Track the timestamp of the most recent signal seen
CTrade trade;

int OnInit()
{
   bridgeStartTime = TimeCurrent();
   lastSignalTime = bridgeStartTime - 3600;  // Start 1 hour before bridge start to catch recent signals
   Print("PulseCopy Self-Hosted Bridge Started.");
   Print("Target API: ", ApiUrl);
   Print("Bridge start time (UTC): ", bridgeStartTime);
   if(StringLen(FollowerKey) > 0)
      Print("Follower Key: ", FollowerKey);
   EventSetTimer(PollIntervalSec);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   uchar result[];
   string resultHeaders;
   uchar requestData[] = {};
   string requestUrl = ApiUrl;
   string followerKey = TrimString(FollowerKey);
   if(StringLen(followerKey) > 0)
   {
      requestUrl += StringFind(ApiUrl, "?") >= 0 ? "&followerKey=" : "?followerKey=";
      requestUrl += followerKey;
   }
   requestUrl += StringFind(requestUrl, "?") >= 0 ? "&" : "?";
   int lookback = PollIntervalSec > 0 ? PollIntervalSec : 5;
   int sinceSec = lastSignalTime > lookback ? (int)(lastSignalTime - lookback) : 0;
   requestUrl += "since=" + IntegerToString(sinceSec * 1000);

   int status = WebRequest("GET", requestUrl, "Content-Type: application/json\r\n", RequestTimeoutMs, requestData, result, resultHeaders);
   if(status == 200)
   {
      string response = CharArrayToString(result);
      Print("Bridge response: ", response);

      if(StringFind(response, "\"success\":true") >= 0)
      {
         if(TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) == 0)
         {
            Print("[BRIDGE-POLL] ⚠ Automated trading is disabled in MetaTrader. Enable AutoTrading and allow WebRequest for the target domain.");
            // we still parse the response but avoid executing trades while the terminal disables automated trading
         }
         string signalId;
         string currencyPair;
         string direction;
         string action;
         double entryPrice = 0;
         double stopLoss = 0;
         double takeProfit = 0;
         double lotSize = 0;
         int parseStart = 0;
         bool processedAny = false;

         int nextStart = 0;
         // Process all pending signals in the response
         while(ParseFirstPendingSignal(response, parseStart, nextStart, signalId, currencyPair, direction, action, entryPrice, stopLoss, takeProfit, lotSize))
         {
            parseStart = nextStart;
            if(StringLen(signalId) == 0)
            {
               Print("No valid signal id found in response.");
               continue;
            }

            if(StringCompare(signalId, lastProcessedSignal) == 0)
            {
               Print("Signal already processed: ", signalId);
               continue;
            }

            Print("Processing signal ", signalId, ": ", action, " ", direction, " ", currencyPair);

            // If opening and an existing position in the same direction exists, acknowledge and skip executing
            bool alreadySameDir = false;
            if(StringCompare(action, "OPEN") == 0)
            {
               if(PositionSelect(currencyPair))
               {
                  int existingType = (int)PositionGetInteger(POSITION_TYPE);
                  if((existingType == POSITION_TYPE_BUY && StringCompare(direction, "BUY") == 0) ||
                     (existingType == POSITION_TYPE_SELL && StringCompare(direction, "SELL") == 0))
                  {
                     alreadySameDir = true;
                  }
               }
            }

            if(alreadySameDir)
            {
               Print("Existing position in same direction for ", currencyPair, "; acknowledging signal: ", signalId);
               lastProcessedSignal = signalId;
               lastSignalTime = TimeCurrent();  // Update signal time tracker
               processedAny = true;
               if(AckSignal(signalId))
                  Print("Signal acknowledged back to server: ", signalId);
               continue;
            }

            bool success = false;
            if(StringCompare(action, "CLOSE") == 0)
            {
               // support CLOSE ALL when currencyPair is empty or equals ALL/*
               if(StringLen(currencyPair) == 0 || StringCompare(StringToUpper(currencyPair), "ALL") == 0 || StringCompare(currencyPair, "*") == 0)
               {
                  success = ExecuteCloseAll();
               }
               else
               {
                  success = ExecuteCloseSignal(currencyPair);
               }
            }
            else
            {
               success = ExecuteSignal(currencyPair, direction, entryPrice, stopLoss, takeProfit, lotSize);
            }

            if(success)
            {
               lastProcessedSignal = signalId;
               lastSignalTime = TimeCurrent();  // Update signal time tracker
               processedAny = true;
               Print("Signal processed: ", signalId);
               if(AckSignal(signalId))
                  Print("Signal acknowledged back to server: ", signalId);
            }
            else
            {
               Print("Signal processing failed: ", signalId);
            }
         }

         if(!processedAny)
         {
            Print("No new pending signals were processed.");
         }
      }
      else
      {
         Print("Bridge warning: unexpected response from API. ", response);
      }
   }
   else
   {
      Print("PulseCopy error: WebRequest failed with code ", status);
      if(status <= 0)
      {
         Print("Make sure the domain is added to MT5 WebRequest allowed URLs.");
      }
   }
}

string NormalizeSymbol(const string value)
{
   string normalized = value;
   if(StringLen(normalized) == 0)
      return normalized;

   StringReplace(normalized, "/", "");
   StringReplace(normalized, " ", "");
   StringReplace(normalized, "-", "");
   StringReplace(normalized, "_", "");
   return normalized;
}

int FindMatchingBrace(const string json, int openBraceIndex)
{
   int depth = 0;
   for(int i = openBraceIndex; i < StringLen(json); i++)
   {
      if(StringGetCharacter(json, i) == '{')
         depth++;
      else if(StringGetCharacter(json, i) == '}')
      {
         depth--;
         if(depth == 0)
            return i;
      }
   }
   return -1;
}

bool ParseFirstPendingSignal(const string json, int searchFrom, int &nextSearchStart, string &signalId, string &currencyPair, string &direction, string &action, double &entryPrice, double &stopLoss, double &takeProfit, double &lotSize)
{
   int signalsIndex = StringFind(json, "\"signals\"");
   int arrayStart = -1;
   if(signalsIndex >= 0)
      arrayStart = StringFind(json, "[", signalsIndex);

   int objectStart = -1;
   int objectEnd = -1;
   int searchPos = arrayStart >= 0 ? MaxInt(arrayStart, searchFrom) : searchFrom;

   while(true)
   {
      objectStart = StringFind(json, "{", searchPos);
      if(objectStart < 0)
         break;

      objectEnd = FindMatchingBrace(json, objectStart);
      if(objectEnd < 0 || objectEnd <= objectStart)
         break;

      string document = StringSubstr(json, objectStart, objectEnd - objectStart + 1);
      string candidateId = ExtractJsonField(document, "id");
      if(StringLen(candidateId) == 0)
         candidateId = ExtractJsonField(document, "signalId");

      bool looksLikeSignal = StringLen(candidateId) > 0 || StringFind(document, "\"currencyPair\"") >= 0 || StringFind(document, "\"symbol\"") >= 0 || StringFind(document, "\"action\"") >= 0;
      if(looksLikeSignal)
      {
         nextSearchStart = objectEnd + 1;
         signalId = candidateId;
         currencyPair = ExtractJsonField(document, "currencyPair");
         if(StringLen(currencyPair) == 0)
            currencyPair = ExtractJsonField(document, "symbol");
         currencyPair = NormalizeSymbol(currencyPair);

         direction = ExtractJsonField(document, "direction");
         if(StringLen(direction) == 0)
            direction = ExtractJsonField(document, "side");

         action = ExtractJsonField(document, "action");
         if(StringLen(action) == 0)
            action = "OPEN";
         if(StringCompare(action, "CLOSE", false) != 0)
            action = "OPEN";

         string entryPriceValue = ExtractJsonField(document, "entryPrice");
         if(StringLen(entryPriceValue) == 0)
            entryPriceValue = ExtractJsonField(document, "price");
         entryPrice = StringToDouble(entryPriceValue);

         stopLoss = StringToDouble(ExtractJsonField(document, "stopLoss"));
         takeProfit = StringToDouble(ExtractJsonField(document, "takeProfit"));

         string lotSizeValue = ExtractJsonField(document, "lotSize");
         if(StringLen(lotSizeValue) == 0)
            lotSizeValue = ExtractJsonField(document, "volume");
         lotSize = StringToDouble(lotSizeValue);

         return StringLen(signalId) > 0;
      }

      searchPos = objectEnd + 1;
   }

   return false;
}

int MaxInt(int a, int b)
{
   return a > b ? a : b;
}

string ExtractJsonField(const string json, const string field)
{
   string needle = "\"" + field + "\":";
   int pos = StringFind(json, needle);
   if(pos < 0) return "";

   pos += StringLen(needle);
   while(pos < StringLen(json) && (StringGetCharacter(json, pos) == 32 || StringGetCharacter(json, pos) == 9 || StringGetCharacter(json, pos) == 10 || StringGetCharacter(json, pos) == 13))
      pos++;

   if(pos >= StringLen(json)) return "";

   if(StringGetCharacter(json, pos) == '"')
   {
      pos++;
      int end = StringFind(json, "\"", pos);
      if(end < 0) return "";
      return StringSubstr(json, pos, end - pos);
   }

   int end = StringFind(json, ",", pos);
   int endBrace = StringFind(json, "}", pos);
   if(end < 0 || (endBrace >= 0 && endBrace < end))
      end = endBrace;
   if(end < 0)
      end = StringLen(json);

   return StringSubstr(json, pos, end - pos);
}

string TrimString(const string value)
{
   int start = 0;
   int end = StringLen(value) - 1;

   while(start <= end && (StringGetCharacter(value, start) == 32 || StringGetCharacter(value, start) == 9 || StringGetCharacter(value, start) == 10 || StringGetCharacter(value, start) == 13))
      start++;
   while(end >= start && (StringGetCharacter(value, end) == 32 || StringGetCharacter(value, end) == 9 || StringGetCharacter(value, end) == 10 || StringGetCharacter(value, end) == 13))
      end--;

   return (start > end) ? "" : StringSubstr(value, start, end - start + 1);
}

bool IsStopLossValid(const int orderType, const double price, const double stopLoss)
{
   if(stopLoss <= 0)
      return false;

   if(orderType == ORDER_TYPE_BUY)
      return stopLoss < price;

   return stopLoss > price;
}

bool IsTakeProfitValid(const int orderType, const double price, const double takeProfit)
{
   if(takeProfit <= 0)
      return false;

   if(orderType == ORDER_TYPE_BUY)
      return takeProfit > price;

   return takeProfit < price;
}

void SanitizeStops(const string currencyPair, const int orderType, const double price, double &stopLoss, double &takeProfit)
{
   double point = SymbolInfoDouble(currencyPair, SYMBOL_POINT);
   int stopLevel = (int)SymbolInfoInteger(currencyPair, SYMBOL_TRADE_STOPS_LEVEL);
   double minDistance = stopLevel > 0 ? stopLevel * point : 0;

   if(stopLoss > 0)
   {
      bool invalidSide = !IsStopLossValid(orderType, price, stopLoss);
      bool invalidDistance = minDistance > 0 && MathAbs(price - stopLoss) < minDistance;
      if(invalidSide || invalidDistance)
      {
         Print("Invalid stop loss for ", orderType == ORDER_TYPE_BUY ? "BUY" : "SELL", " order; clearing SL. price=", DoubleToString(price, _Digits), " stopLoss=", DoubleToString(stopLoss, _Digits), " minDistance=", DoubleToString(minDistance, _Digits));
         stopLoss = 0;
      }
   }

   if(takeProfit > 0)
   {
      bool invalidSide = !IsTakeProfitValid(orderType, price, takeProfit);
      bool invalidDistance = minDistance > 0 && MathAbs(price - takeProfit) < minDistance;
      if(invalidSide || (StrictTPValidation && invalidDistance))
      {
         Print("Invalid take profit for ", orderType == ORDER_TYPE_BUY ? "BUY" : "SELL", " order; clearing TP. price=", DoubleToString(price, _Digits), " takeProfit=", DoubleToString(takeProfit, _Digits), " minDistance=", DoubleToString(minDistance, _Digits));
         takeProfit = 0;
      }
   }
}

bool ExecuteSignal(const string currencyPair, const string direction, double entryPrice, double stopLoss, double takeProfit, double lotSize)
{
   if(StringLen(currencyPair) == 0 || StringLen(direction) == 0)
      return false;

   // Ensure the requested symbol is available in Market Watch
   if(!SymbolSelect(currencyPair, true))
   {
      Print("SymbolSelect failed for ", currencyPair, " - symbol may not be in Market Watch or not supported by broker.");
      return false;
   }

   double price = 0;
   ENUM_ORDER_TYPE orderType = ORDER_TYPE_BUY;
   if(StringCompare(direction, "SELL") == 0)
   {
      orderType = ORDER_TYPE_SELL;
      price = SymbolInfoDouble(currencyPair, SYMBOL_BID);
   }
   else
   {
      orderType = ORDER_TYPE_BUY;
      price = SymbolInfoDouble(currencyPair, SYMBOL_ASK);
   }

   if(price <= 0)
   {
      Print("Unable to resolve market price for symbol: ", currencyPair);
      return false;
   }

   Print("Resolved market price for ", currencyPair, ": ", DoubleToString(price, _Digits), " (direction=", direction, ")");
      // Prevent duplicate orders: if a position already exists for this symbol in the same direction, skip
      if(PositionSelect(currencyPair))
      {
         int existingType = (int)PositionGetInteger(POSITION_TYPE);
         if((existingType == POSITION_TYPE_BUY && orderType == ORDER_TYPE_BUY) || (existingType == POSITION_TYPE_SELL && orderType == ORDER_TYPE_SELL))
         {
            Print("Skipping signal: existing position for ", currencyPair, " in same direction");
            return false;
         }
      }

      SanitizeStops(currencyPair, orderType, price, stopLoss, takeProfit);

   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);

   request.action = TRADE_ACTION_DEAL;
   request.symbol = currencyPair;
   request.volume = lotSize > 0 ? lotSize : OrderVolume;
   request.type = orderType;
   request.price = price;
   request.sl = stopLoss > 0 ? stopLoss : 0;
   request.tp = takeProfit > 0 ? takeProfit : 0;
   request.deviation = OrderDeviation;
   request.type_filling = ORDER_FILLING_IOC;
   request.type_time = ORDER_TIME_GTC;

   if(request.sl > 0)
      Print("Using stop loss: ", DoubleToString(request.sl, _Digits));
   if(request.tp > 0)
      Print("Using take profit: ", DoubleToString(request.tp, _Digits));

   if(!OrderSend(request, result))
   {
      Print("OrderSend failed: retcode=", result.retcode, " comment=", result.comment);
      if(result.retcode == 10017)
      {
         Print("CRITICAL: retcode 10017 = Trade disabled on account/EA.");
         Print("  1. Ensure EA has 'Allow automated trading' enabled in Tools > Options > Expert Advisors");
         Print("  2. Check broker account settings for algo trading restrictions");
         Print("  3. Verify account is not in read-only mode");
      }
      return false;
   }

   Print("OrderSend result: retcode=", result.retcode, " deal=", result.deal, " price=", DoubleToString(price, _Digits));
   return true;
}

bool ExecuteCloseSignal(const string currencyPair)
{
   if(StringLen(currencyPair) == 0)
      return false;

   // Ensure the symbol is in Market Watch to allow close operations
   if(!SymbolSelect(currencyPair, true))
   {
      Print("SymbolSelect failed for CLOSE symbol ", currencyPair, " - symbol may not be in Market Watch.");
   }

   Print("ExecuteCloseSignal: attempting to close positions for ", currencyPair);

   // Try selecting by symbol first
   if(PositionSelect(currencyPair))
   {
      ulong ticket = (ulong)PositionGetInteger(POSITION_TICKET);
      Print("Found selected position for symbol ", currencyPair, " ticket=", ticket);
      if(ticket != 0)
      {
         if(trade.PositionClose(ticket))
         {
            Print("PositionClose requested for ", currencyPair, " ticket=", ticket);
            return true;
         }
         else
         {
            Print("PositionClose by ticket failed for ", currencyPair, " ticket=", ticket);
         }
      }
      else
      {
         Print("Position selected but ticket==0 for symbol: ", currencyPair);
      }

      // fallback: try closing by symbol using CTrade overload
      if(trade.PositionClose(currencyPair))
      {
         Print("PositionClose by symbol succeeded for: ", currencyPair);
         return true;
      }
      else
      {
         Print("PositionClose by symbol failed for: ", currencyPair);
      }
   }
   else
   {
      Print("PositionSelect failed for symbol: ", currencyPair, " - will scan all positions for matches.");
   }

   // Scan all positions to find matching symbols and close them
   int total = PositionsTotal();
   bool anyClosed = false;
   for(int i = total - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(!PositionSelectByTicket(ticket)) continue;
      string sym = PositionGetString(POSITION_SYMBOL);
      if(StringCompare(sym, currencyPair) == 0)
      {
         Print("Found matching position ticket=", ticket, " symbol=", sym, " - closing.");
         if(trade.PositionClose(ticket))
         {
            anyClosed = true;
            Print("PositionClose requested for ticket=", ticket);
         }
         else
         {
            Print("Failed to close ticket=", ticket);
         }
      }
   }

   if(!anyClosed)
      Print("No positions closed for symbol: ", currencyPair);

   return anyClosed;
}

bool ExecuteCloseAll()
{
   int total = PositionsTotal();
   if(total <= 0)
   {
      Print("No open positions to close.");
      return false;
   }

   bool anyClosed = false;
   // iterate from end in case closing reduces the list
   for(int i = total - 1; i >= 0; i--)
   {
         ulong ticket = PositionGetTicket(i);
         if(ticket == 0) continue;
         if(!PositionSelectByTicket(ticket))
         {
            Print("PositionSelectByTicket failed for ticket=", ticket);
            continue;
         }
         string sym = PositionGetString(POSITION_SYMBOL);
         Print("Attempting close for ticket=", ticket, " symbol=", sym);
         // attempt to close by ticket
         if(trade.PositionClose(ticket))
         {
            anyClosed = true;
            Print("PositionClose requested for ticket=", ticket);
         }
         else
         {
            Print("PositionClose by ticket failed for ticket=", ticket, "; trying by symbol: ", sym);
            if(trade.PositionClose(sym))
            {
               anyClosed = true;
               Print("PositionClose by symbol requested for ", sym);
            }
            else
            {
               Print("PositionClose by symbol also failed for ", sym);
            }
         }
   }

   return anyClosed;
}

bool AckSignal(const string signalId)
{
   if(StringLen(signalId) == 0)
      return false;

   string json = "{\"action\":\"ack\",\"signalId\":\"" + signalId + "\"}";
   uchar requestData[];
   StringToCharArray(json, requestData);

   uchar result[];
   string resultHeaders;
   int status = WebRequest("POST", ApiUrl, "Content-Type: application/json\r\n", RequestTimeoutMs, requestData, result, resultHeaders);
   if(status != 200)
   {
      Print("Ack request failed, HTTP status=", status);
      return false;
   }

   string response = CharArrayToString(result);
   Print("Ack response: ", response);
   return StringFind(response, "\"success\":true") >= 0;
}
