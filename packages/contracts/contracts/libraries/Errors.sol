// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Errors {
    error Unauthorized();
    error InvalidAddress();
    error InvalidPassState();
    error PassExpired();
    error MerchantNotApproved();
    error InvalidProduct();
    error ProductNotApproved();
    error InsufficientAvailableValue();
    error DuplicateOrderId();
    error RedemptionNotReservable();
    error RedemptionNotCapturable();
    error InvalidPolicy();
    error InvalidIdentifier();
    error ZeroAddress();
    error ZeroAmount();
    error AlreadyBound();
    error NotBound();
}
