# Campaign Success Scenario Implementation

## Overview

This document outlines the implementation of campaign success scenarios, including campaign status tracking and creator withdrawal functionality.

## ✅ Completed Features

### 1. Campaign Status Tracking

**Files Created/Modified:**

- `hooks/use-campaign-status.ts` - Hook for monitoring campaign status from blockchain
- `components/campaigns/campaign-status-badge.tsx` - Real-time status badge component
- `app/api/campaigns/update-status/route.ts` - API endpoint for updating campaign status in database

**Features:**

- Real-time blockchain status checking
- Automatic status determination based on:
  - Current supply vs. minimum required sales
  - Campaign deadline (timestamp)
- Status categories:
  - **LIVE**: Campaign is ongoing and before deadline
  - **SUCCESS**: Campaign reached minRequiredSales after deadline
  - **FAILED**: Campaign did not reach minRequiredSales after deadline
- Automatic database synchronization
- Status refreshes every 30 seconds

### 2. Creator Withdrawal Functionality

**Files Created/Modified:**

- `hooks/use-withdraw-creator-funds.ts` - Hook for creator fund withdrawal
- `components/campaigns/creator-withdrawal.tsx` - Creator withdrawal UI component
- `app/api/campaigns/withdrawal/route.ts` - API endpoints for recording withdrawals

**Smart Contract Functions Implemented:**

- `withdrawCreatorsFunds()` - Withdraw funds when campaign succeeds
- `totalEarnedByCreator()` - View total earnings
- `withdrawalAmount()` - View available withdrawal amount

**Features:**

- Only visible to campaign creator
- Only shown when campaign status is SUCCESS
- Displays:
  - Total earned amount
  - Available withdrawal amount
- Transaction tracking and database recording
- Etherscan integration for transaction verification

### 3. UI Integration

**Files Modified:**

- `components/campaigns/campaign-details.tsx`

  - Added CampaignStatusBadge to hero section
  - Added CreatorWithdrawal component in sidebar
  - Added useAccount hook for creator verification
  - Added database status state management

- `components/campaigns/campaign-card.tsx`

  - Integrated CampaignStatusBadge
  - Updated Campaign interface to include dbStatus

- `components/campaigns/campaign-grid.tsx`
  - Updated Campaign interface to include dbStatus
  - Pass dbStatus from API to campaign cards

## Technical Implementation Details

### Campaign Status Detection Logic

```typescript
const currentTime = BigInt(Math.floor(Date.now() / 1000));
const hasEnded = currentTime > timestamp;
const isSuccessful = currentSupply >= minRequiredSales && hasEnded;
const isFailed = currentSupply < minRequiredSales && hasEnded;
const isLive = !hasEnded;
```

### Creator Verification

```typescript
address &&
  campaign.creator.toLowerCase() === address.toLowerCase() &&
  campaignDbStatus === "SUCCESS";
```

### Database Status Updates

The system automatically updates the database when blockchain status changes are detected, ensuring consistency between on-chain and off-chain data.

## API Endpoints

### POST /api/campaigns/update-status

Updates campaign status in database

- **Body**: `{ contractAddress, status }`
- **Status values**: LIVE, SUCCESS, FAILED

### POST /api/campaigns/withdrawal

Records a creator withdrawal

- **Body**: `{ contractAddress, creatorAddress, amountWei, txHash, blockNumber? }`

### GET /api/campaigns/withdrawal

Retrieves withdrawal history

- **Query params**: `contractAddress` or `creatorAddress`

## Database Schema

Uses existing Prisma schema:

- `DRSeries.status`: Tracks campaign status (LIVE, SUCCESS, FAILED)
- `CreatorWithdrawal`: Records all withdrawal transactions
- `DRToken.status`: Tracks token status (ACTIVE, REFUNDED, BURNED)

## User Flow

### For Creators (Success Scenario)

1. Campaign reaches deadline
2. System checks if minRequiredSales reached
3. If successful, campaign status automatically updates to SUCCESS
4. Creator sees "Creator Funds" card in campaign details
5. Card shows:
   - Total earned amount
   - Available to withdraw amount
6. Creator clicks "Withdraw Funds" button
7. Wallet prompt for transaction confirmation
8. Transaction submitted to blockchain
9. Withdrawal recorded in database
10. Success notification with Etherscan link
11. Available balance updates automatically

### Status Badge Updates

- Badge polls blockchain every 30 seconds
- Updates UI in real-time
- Syncs status to database automatically
- Visual indicators:
  - 🔵 Blue "Live" - Campaign ongoing
  - ✅ Green "Success" - Goal reached
  - ❌ Red "Failed" - Goal not reached

## Next Steps (Not Implemented Yet)

These features are for the failure scenario and will be implemented next:

- [ ] Implement claimRefund function for failed campaigns
- [ ] Implement burn function for token management
- [ ] Create UI for supporters to claim refunds on failed campaigns

## Testing Recommendations

1. Test campaign with current time past deadline and supply >= minRequiredSales
2. Verify status badge updates correctly
3. Test withdrawal as campaign creator
4. Verify withdrawal records in database
5. Test with multiple campaigns in different states
6. Verify status updates occur automatically
7. Test error handling for insufficient funds

## Gas Configuration

All contract interactions use the `getGasConfig(chainId)` utility for optimal gas settings on Sepolia testnet.

## Security Considerations

- Only campaign creator can see withdrawal interface
- Contract enforces withdrawal rules on-chain
- Database serves as audit trail
- Transaction hashes stored for verification
- Proper error handling throughout



