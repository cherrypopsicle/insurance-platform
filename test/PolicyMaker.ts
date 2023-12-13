﻿import {ethers} from "hardhat";
import {expect} from "chai";
import {Contract} from "ethers";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {PolicyMaker} from "../typechain";
import { BigNumberish } from "ethers";

describe.only("PolicyMaker", function () {
    let policyMaker: PolicyMaker;
    let owner: HardhatEthersSigner, addr1: HardhatEthersSigner;

    // Deploying the PolicyMaker contract before each test
    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const PolicyMaker = await ethers.getContractFactory("PolicyMaker");
        policyMaker = await PolicyMaker.deploy(owner);
        await policyMaker.waitForDeployment();
    });

    describe("Policy Creation", function () {
        it("Should allow the owner to create a new policy", async function () {            
            const coverageAmount: any = ethers.parseEther('100'); // Assuming no decimals needed
            const premiumRate = ethers.parseEther('10'); // Monthly rate
            const duration: any = ethers.parseUnits('365', 0);
            const amount: any = ethers.parseEther('20');
            const policyId: any = ethers.parseUnits('1', 0);
            const monthsGracePeriod = ethers.parseUnits('6', 0);
            const initialPremiumFee: any = ethers.parseEther('20');
            const penaltyRate = ethers.parseUnits('20', 0);
            const address: any = addr1.address

            const tx = await policyMaker.createPolicy(coverageAmount, initialPremiumFee, premiumRate, duration, penaltyRate, monthsGracePeriod);

            const policy = await policyMaker.policies(policyId);
            expect(policy.coverageAmount).to.equal(ethers.parseEther('100'));
            expect(policy.premiumRate).to.equal(ethers.parseEther('10'));
            expect(policy.duration).to.equal(365);
            expect(policy.isActive).to.be.true;
        });

        // Add more tests for policy updates, deactivation, etc.
    });

    describe("Premium Payments", function () {
        it("Should allow payment of initial premium and set claimant status", async function () {
            const coverageAmount: any = ethers.parseEther('100'); // Assuming no decimals needed
            const premiumRate = ethers.parseEther('10'); // Monthly rate
            const duration: any = ethers.parseUnits('365', 0);
            const amount: any = ethers.parseEther('20');
            const policyId: any = ethers.parseUnits('1', 0);
            const monthsGracePeriod = ethers.parseUnits('6', 0);
            const initialPremiumFee: any = ethers.parseEther('20');
            const penaltyRate = ethers.parseUnits('20', 0);
            const address: any = addr1.address

            await policyMaker.createPolicy(coverageAmount, initialPremiumFee, premiumRate, duration, penaltyRate, monthsGracePeriod);

            await policyMaker.connect(addr1).payInitialPremium(policyId, {value: amount});

            const isClaimant: boolean = await policyMaker.isPolicyOwner(policyId, address);
            expect(isClaimant).to.be.true;

            const paidAmount = await policyMaker.premiumsPaid(policyId, address);
            console.log(paidAmount, " is the amount of premium paid")
            expect(paidAmount).to.equal((ethers.parseEther('20')));
        });
    });
    describe("Premium Calculation", function () {
        it("Should calculate the correct premium over time", async function () {
            const coverageAmount: any = ethers.parseEther('100'); // Assuming no decimals needed
            const premiumRate = ethers.parseEther('10'); // Monthly rate
            const duration: any = ethers.parseUnits('365', 0);
            const amount: any = ethers.parseEther('20');
            const policyId: any = ethers.parseUnits('1', 0);
            const monthsGracePeriod = ethers.parseUnits('6', 0);
            const initialPremiumFee: any = ethers.parseEther('20');
            const penaltyRate = ethers.parseUnits('20', 0);

            await policyMaker.createPolicy(coverageAmount, initialPremiumFee, premiumRate, duration, penaltyRate, monthsGracePeriod);
            await policyMaker.connect(addr1).payInitialPremium(policyId, { value: initialPremiumFee });

            // Fast forward time by 7 months
            const timeToFastForward = 3600 * 24 * 30 * 7;
            await ethers.provider.send("evm_increaseTime", [timeToFastForward]);
            await ethers.provider.send("evm_mine", []);

            // Calculate premium after 7 months
            const premium = await policyMaker.connect(addr1).calculatePremium(policyId, addr1.address);
            console.log(premium);
            expect(premium).to.be.above(premiumRate);
        });
    });
});