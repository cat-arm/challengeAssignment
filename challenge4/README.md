# Challenge 4: Rate and Throttle API

## Architecture

Three stand-alone services calling each other:

```
Caller Service → Throttle Service → Echo Service
```

## Services

### 1. Caller Service
- Calls Throttle Service at 16^n rates per minute:
  - 1st minute: 16 calls
  - 2nd minute: 256 calls
  - 3rd minute: 4,096 calls
  - 4th minute: 65,536 calls
- Each call has incremental ID starting from 1
- Each call contains the string of this incremental ID
- Logs output to file with timestamp (when calling and when receiving)

### 2. Throttle Service
- Receives calls from Caller Service
- Throttles requests to never be more than 4,096 calls per minute
- Forwards calls to Echo Service
- Logs all calls and throttle events to file with timestamp

### 3. Echo Service
- Echoes back whatever it receives from Throttle Service
- If exceeding 512 calls per minute, responds with "Exceeding Limit"
- Logs input and output to file with timestamp
- Includes necessary information to understand current capacity of rate limit

## Running

You need to run all three services in separate terminals:

### Terminal 1 - Echo Service
```bash
cd echo-service
npm install
npm start
```

### Terminal 2 - Throttle Service
```bash
cd throttle-service
npm install
npm start
```

### Terminal 3 - Caller Service
```bash
cd caller-service
npm install
npm start
```

## Notes
- All services must log to files with timestamps
- Logging demonstrates that all services work as expected
- If requirements are too heavy, you can adjust the values (marked in orange in requirements)

