'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import { BrowserProvider, TypedDataEncoder } from 'ethers';
import Container from '@/components/Layout/Container';
import Link from 'next/link';
import { apiClient } from '@/lib/api/apiClient';
import * as Sentry from '@sentry/nextjs';
import SmartContracts from './components/SmartContracts';

export const dynamic = 'force-static';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const documentationSections = [
  {
    title: 'Getting Started',
    id: 'getting-started',
    subsections: [
      { title: 'Introduction', id: 'introduction' },
      { title: 'Quick Start', id: 'quick-start' }
    ]
  },
  {
    title: 'Smart Contracts',
    id: 'smart-contracts',
    subsections: [
      { title: 'Contract Overview', id: 'contract-overview' },
      { title: 'Lockx Contract', id: 'lockx-contract' },
      { title: 'Deposits Contract', id: 'deposits-contract' },
      { title: 'Withdrawals Contract', id: 'withdrawals-contract' },
      { title: 'Signature Verification', id: 'signature-verification' }
    ]
  },
  {
    title: 'Lockbox',
    id: 'lockx-nft',
    subsections: [
      { title: 'Secure Asset Storage', id: 'secure-storage' },
      { title: 'Soulbound Nature', id: 'soulbound-nature' },
      { title: 'Multi-Asset Support', id: 'multi-asset' }
    ]
  },
  {
    title: 'Security Benefits',
    id: 'security-benefits',
    subsections: [
      { title: 'Wallet Attack Protection', id: 'wallet-attacks' },
      { title: 'Contract Attack Protection', id: 'contract-attacks' }
    ]
  },
  {
    title: 'Key Management',
    id: 'key-management',
    subsections: [
      { title: 'Key Fraction Technology', id: 'key-fraction-tech' },
      { title: '2FA Protection', id: '2fa-protection' },
      { title: 'Self custody signing', id: 'Self custody' },
      { title: 'Key Rotation', id: 'key-rotation' }
    ]
  },
  {
    title: 'Security & Authorization',
    id: 'security',
    subsections: [
      { title: 'EIP-712 Signatures', id: 'eip-712' },
      { title: 'Security Measures', id: 'security-measures' },
      { title: 'Direct Contract Interaction', id: 'direct-interaction' }
    ]
  },
  {
    title: 'FAQ & Support',
    id: 'faq-support',
    subsections: [
      { title: 'FAQs', id: 'faq' },
      { title: 'Troubleshooting', id: 'troubleshooting' },
      { title: 'Contact Support', id: 'contact-support' }
    ]
  }
];

interface SectionRefs {
  [key: string]: HTMLElement | null;
}

function Sidebar({ onSectionClick, activeSection }: { onSectionClick: (id: string) => void, activeSection: string }) {
  return (
    <nav className="space-y-1">
      {documentationSections.map((section) => (
        <div key={section.id} className="mb-4">
          <button
            onClick={() => onSectionClick(section.id)}
            className={`flex items-center w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900 ${
              activeSection === section.id ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
          >
            {section.title}
          </button>
          <div className="ml-4 mt-1">
            {section.subsections.map((subsection) => (
              <button
                key={subsection.id}
                onClick={() => onSectionClick(subsection.id)}
                className={`flex items-center w-full rounded-md px-3 py-1.5 text-sm hover:bg-gray-100 hover:text-gray-900 ${
                  activeSection === subsection.id ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}
              >
                {subsection.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRefs = useRef<SectionRefs>({});
  const mainContentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isConnected, connectWallet, address, signMessage } = useWallet();
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const handleJsonClick = (e: React.MouseEvent<HTMLPreElement>) => {
    const target = e.currentTarget;
    
    // Toggle editable state
    if (target.contentEditable !== 'true') {
      target.contentEditable = 'true';
      target.focus();
      target.classList.add('border-2', 'border-purple-400', 'bg-white');
      
      // Set up a way to exit edit mode when clicking outside
      const handleClickOutside = (event: MouseEvent) => {
        if (target !== event.target && !target.contains(event.target as Node)) {
          target.contentEditable = 'false';
          target.classList.remove('border-2', 'border-purple-400', 'bg-white');
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscKey);
        }
      };
      
      // Also exit edit mode on Escape key
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          target.contentEditable = 'false';
          target.classList.remove('border-2', 'border-purple-400', 'bg-white');
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscKey);
        }
      };
      
      // Add event listeners
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }
  };

  const scrollToSection = (id: string) => {
    if (!isBrowser) return;
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'auto' }); // Changed 'smooth' to 'auto'
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const registerSections = () => {
      if (!isBrowser) return;
      const sections: SectionRefs = {};
      documentationSections.forEach(section => {
        if (document.getElementById(section.id)) {
          sections[section.id] = document.getElementById(section.id);
        }
        section.subsections.forEach(subsection => {
          if (document.getElementById(subsection.id)) {
            sections[subsection.id] = document.getElementById(subsection.id);
          }
        });
      });
      sectionRefs.current = sections;
    };

    const handleScroll = () => {
      if (!isBrowser) return;
      const scrollPosition = window.scrollY + 100; // Add offset for header
      
      let currentSection = '';
      let minDistance = Number.MAX_VALUE;
      
      Object.entries(sectionRefs.current).forEach(([id, element]) => {
        const section = element as HTMLElement;
        const distance = Math.abs(section.getBoundingClientRect().top);
        
        if (distance < minDistance) {
          minDistance = distance;
          currentSection = id;
        }
      });
      
      if (currentSection && activeSection !== currentSection) {
        setActiveSection(currentSection);
      }
    };

    registerSections();
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Added empty dependency array

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="min-[1475px]:hidden py-4 sticky top-0 bg-white z-10 border-b">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center px-4 py-2 border rounded-md"
          >
            <span className="mr-2">Documentation Menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 px-4 bg-white mt-2 shadow-lg rounded-md py-4 z-20">
              <div className="max-w-7xl mx-auto">
                <Sidebar onSectionClick={scrollToSection} activeSection={activeSection} />
              </div>
            </div>
          )}
        </div>
      </Container>

      <Container>
        <div className="flex flex-col min-[1475px]:flex-row">
          <aside className="hidden min-[1475px]:block w-64 h-screen sticky top-0 pr-6 overflow-y-auto border-r border-gray-100">
            <div className="py-8">
              <h2 className="text-xl font-bold mb-2">Documentation</h2>
              <p className="text-sm text-gray-600">Lockx documentation portal</p>
            </div>
            <Sidebar onSectionClick={scrollToSection} activeSection={activeSection} />
          </aside>

          <main className="flex-1 py-6 min-[1475px]:py-12 min-[1475px]:pl-10 px-4 min-[1475px]:px-0">
            <div className="max-w-4xl pr-4">
              <section id="getting-started" className="mb-8 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Getting started</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
              </section>
              
              <section id="introduction" className="mb-16 scroll-mt-20">
                <h1 className="text-4xl font-bold mb-2">Documentation</h1>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
                <p className="text-lg text-gray-700 mb-4">
                  Lockx is a decentralized platform for managing Ethereum assets through smart contract powered Lockboxes that act as a tokenized safe deposit box and can store ETH, ERC20 tokens, and NFTs.
                  Our documentation provides comprehensive technical details about our smart contracts, key fraction technology, and business model.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                  <h3 className="text-lg font-semibold mb-2">Independent business model</h3>
                  <p className="text-blue-800">
                    Lockx operates on a platform fee model for use of our key management technology to securely manage your assets. 
                    Our contracts are open and free to use — we do not have any tokens or tokenomics. This model allows us to focus
                    on providing the best possible service without creating artificial scarcity or enforing arbitrary limits on your assets.
                  </p>
                </div>
              </section>

              <section id="quick-start" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Quick start</h2>
                <div className="prose max-w-none">
                  <p>
                    Get started with Lockx by following these simple steps to connect your wallet and create your first bag.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold mb-2">Step 1: Connect Your Wallet</h3>
                      <p>
                        Click on the "Connect wallet" button in the top navigation bar and select your preferred wallet provider. Please accept any wallet connection popup requests.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Supported wallets:</span>
                        <div className="flex items-center gap-1">
                          <img src="/logos/metamask-logo.png" alt="MetaMask" className="h-5 w-5" />
                          <img src="/logos/coinbase-wallet-logo.png" alt="Coinbase Wallet" className="h-5 w-5" />
                          <img src="/logos/brave-wallet-logo.png" alt="Brave Wallet" className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold mb-2">Step 2: Authenticate session</h3>
                      <p>
                        Once your wallet is connected, you will be asked to create an active session by authenticating your wallet. This action will not incur any gas fees.
                      </p>
                      <div className="mt-3 bg-gray-100 p-3 rounded-md">
                        <p className="text-sm text-gray-700">
                          For security purposes, all active sessions expire automatically after 3 hours. You will need to reauthenticate to refresh your session.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold mb-2">Step 3: Select Assets to Lockbox</h3>
                      <p>
                        In your portfolio, click "Create Lockbox" to enter selection mode or select "Create new Lockbox" on an existing Lockbox to initiate a deposit. Then, click and select the tokens and NFTs you want to bag. Note that we recommend bagging no more than 3 different assets at a time to minimize risks of gas failures during minting. As blockchains improve in efficiency and scalability, more assets can be bundled within one transaction.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold mb-2">Step 4: Complete the Bagging Process</h3>
                      <p>
                        Follow the guided workflow to select your key management option, confirm your assets, and complete payment to redeem your Lockbox.
                      </p>
                      <div className="mt-3 bg-gray-100 p-3 rounded-md">
                        <p className="text-sm text-gray-700 font-medium">The bagging process includes:</p>
                        
                        <div className="mt-2 ml-2">
                          <p className="text-sm text-gray-700 font-medium">Choosing your key management option</p>
                          <ul className="text-sm text-gray-700 mt-1 list-disc pl-5 space-y-1">
                            <li>Self custody keys ($4.99 platform fee) - Full control with self custody keys and 2FA protection, requiring you to manage your own private keys.</li>
                            <li>Lockx key fraction keys ($9.99 platform fee) - Access to our patent-pending encrypted key fraction technology that combines your wallet signature with an encrypted key fraction to trustlessly derive key pairs and sign expiring authorization requests for your Lockbox.</li>
                            <li>Lockx key fraction keys include enterprise-grade encryption with industry-standard backups and HSM stored keys with FIPS level 3 compliance for enterprise-grade security.</li>
                          </ul>
                        </div>
                        
                        <div className="mt-3 ml-2">
                          <p className="text-sm text-gray-700 font-medium">Confirming your selected assets</p>
                          <ul className="text-sm text-gray-700 mt-1 list-disc pl-5 space-y-1">
                            <li>The Lockx smart contract offers native support for all ERC20 cryptocurrencies, ERC721 NFTs, and ETH native tokens.</li>
                            <li>Our system enables different combinations of supported assets to be bundled in one transaction.</li>
                          </ul>
                        </div>
                        
                        <div className="mt-3 ml-2">
                          <p className="text-sm text-gray-700 font-medium">Key management selection</p>
                          <ul className="text-sm text-gray-700 mt-1 list-disc pl-5">
                            <li>Choose between Lockx key fraction key fraction technology or self custody options.</li>
                            <li>We provide a free EIP-712 message builder for self custody options.</li>
                          </ul>
                        </div>
                        
                        <div className="mt-3 ml-2">
                          <p className="text-sm text-gray-700 font-medium">Stripe payment processing</p>
                          <ul className="text-sm text-gray-700 mt-1 list-disc pl-5">
                            <li>After finalizing your bagging details, you will be redirected to Stripe to complete your platform fee payment.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-xl font-semibold mb-2">Step 5: Mint your Lockbox</h3>
                      <p>
                        After successful payment, you'll be redirected back to our site where you can begin our secure bagging process to trustlessly derive your secondary key pair and mint your Lockbox to your wallet address. This soulbound Lockbox will serve as your secure safe deposit box for all bagged assets. Deposit and withdraw any time without any additional fees, limits, or restrictions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <a 
                      href="/portfolio" 
                      className="bg-[#AD29FF] text-white text-lg py-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-all no-underline"
                    >
                      <span className="font-bold">Connect wallet</span>
                    </a>
                  </div>
                </div>
              </section>

              <section id="smart-contracts" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Smart Contracts</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
                <SmartContracts />
              </section>

              <section id="lockx-nft" className="mb-8 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Lockbox</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
              </section>

              <section id="secure-storage" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Secure Asset Storage</h2>
                <p className="mb-6">
                  Lockboxes function as secure digital safe deposit boxes in your wallet, with direct 1:1 mapping of deposited assets 
                  to the specific Lockbox. Each asset is precisely mapped to its owner's NFT through a secure token ID system, with 
                  exact precision maintained for all asset types.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Direct Asset Mapping</h3>
                  <p className="mb-4">
                    Every Lockbox maintains precise mappings between the tokenId and deposited assets using secure on-chain storage structures:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// ETH balance mapping - simplified for gas efficiency</span>
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#d6bcfa;">uint256</span><span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> _baggedETH;

<span style="color:#a0aec0;">// ERC20 token mappings</span>
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">address</span> <span style="color:#faf089;">=></span> <span style="color:#d6bcfa;">uint256</span><span style="color:#faf089;">))</span> <span style="color:#63b3ed;">internal</span> _erc20Balances;
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#d6bcfa;">address</span>[]<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> _erc20TokenAddresses;
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">address</span> <span style="color:#faf089;">=></span> <span style="color:#d6bcfa;">bool</span><span style="color:#faf089;">))</span> <span style="color:#63b3ed;">internal</span> _erc20Known;

<span style="color:#a0aec0;">// ERC721 NFT mappings</span>
<span style="color:#63b3ed;">struct</span> <span style="color:#68d391;">BaggedNFT</span> <span style="color:#faf089;">{</span> <span style="color:#d6bcfa;">address</span> nftContract; <span style="color:#d6bcfa;">uint256</span> nftTokenId; <span style="color:#faf089;">}</span>
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#d6bcfa;">bytes32</span>[]<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> _nftKeys;
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">bytes32</span> <span style="color:#faf089;">=></span> BaggedNFT<span style="color:#faf089;">))</span> <span style="color:#63b3ed;">internal</span> _nftData;
<span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> <span style="color:#faf089;">=></span> <span style="color:#63b3ed;">mapping</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">bytes32</span> <span style="color:#faf089;">=></span> <span style="color:#d6bcfa;">bool</span><span style="color:#faf089;">))</span> <span style="color:#63b3ed;">internal</span> _nftKnown;` }} />
                  </div>
                  
                  <p className="text-gray-700">
                    These storage structures ensure that each asset is linked directly to a specific Lockbox token ID, creating a secure 1:1 relationship between your NFT and the assets it contains.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold mb-3">Your Assets, Your Control</h4>
                    <p>
                      Lockx contracts have no administrator backdoors, privileged roles, or built-in methods to access user funds. The contract has no "admin functions" 
                      that can drain liquidity, pause withdrawals, or modify balances. Your assets remain securely mapped to your NFT with no external control mechanisms.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold mb-3">Zero Fee Structure</h4>
                    <p>
                      There are no built-in smart contract fees or costs for minting, deposits, or withdrawals, with no interaction fees, arbitrary deposit or withdrawal limits, tokenomics, upgradeability, or liquidity-draining functions. Your Lockx NFT—and the assets it holds—always remains mapped to the wallet it is bound to, giving you continuous access to your funds even if the Lockx interface or web app becomes unavailable.
                    </p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Maximum Precision Guarantees</h3>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-2">ETH Precision</h4>
                    <p className="mb-4">
                      ETH balances are stored in full wei precision (10<sup>18</sup> units per ETH), 
                      ensuring exact accounting down to the smallest unit of ether:
                    </p>
                    <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                      <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// Add ETH with exact precision</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">_depositETH</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> tokenId, <span style="color:#d6bcfa;">uint256</span> amountETH<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> <span style="color:#faf089;">{</span>
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>amountETH == 0<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">return</span>;
    _baggedETH[tokenId] += amountETH;
<span style="color:#faf089;">}</span>` }} />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-2">ERC20 Token Precision with Delta Tracking</h4>
                    <p className="mb-4">
                      ERC20 token balances maintain the token's native decimal precision with an advanced delta-based tracking system
                      that guarantees the exact amount received is what gets recorded:
                    </p>
                    <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                      <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// Add ERC20 tokens with exact token precision using delta tracking</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">_depositERC20</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">address</span> tokenAddress,
    <span style="color:#d6bcfa;">uint256</span> amount
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> <span style="color:#faf089;">{</span>
    IERC20 t = IERC20<span style="color:#faf089;">(</span>tokenAddress<span style="color:#faf089;">)</span>;

    <span style="color:#a0aec0;">// Register token if new</span>
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>!_erc20Known[tokenId][tokenAddress]<span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
        _erc20TokenAddresses[tokenId].push<span style="color:#faf089;">(</span>tokenAddress<span style="color:#faf089;">)</span>;
        _erc20Known[tokenId][tokenAddress] = <span style="color:#63b3ed;">true</span>;
    <span style="color:#faf089;">}</span>

    <span style="color:#a0aec0;">// Pull tokens</span>
    <span style="color:#d6bcfa;">uint256</span> beforeBal = t.balanceOf<span style="color:#faf089;">(</span><span style="color:#63b3ed;">address</span><span style="color:#faf089;">(</span><span style="color:#63b3ed;">this</span><span style="color:#faf089;">))</span>;
    t.safeTransferFrom<span style="color:#faf089;">(</span>msg.sender, <span style="color:#63b3ed;">address</span><span style="color:#faf089;">(</span><span style="color:#63b3ed;">this</span><span style="color:#faf089;">)</span>, amount<span style="color:#faf089;">)</span>;
    <span style="color:#d6bcfa;">uint256</span> afterBal  = t.balanceOf<span style="color:#faf089;">(</span><span style="color:#63b3ed;">address</span><span style="color:#faf089;">(</span><span style="color:#63b3ed;">this</span><span style="color:#faf089;">))</span>;

    <span style="color:#a0aec0;">// Book the delta</span>
    <span style="color:#a0aec0;">// Ensures assets booked match assets received regardless of input</span>
    <span style="color:#d6bcfa;">uint256</span> delta = afterBal > beforeBal ? afterBal - beforeBal : 0;
    
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>delta == 0<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> ZeroAmount<span style="color:#faf089;">()</span>;
    
    _erc20Balances[tokenId][tokenAddress] += delta;
<span style="color:#faf089;">}</span>` }} />
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                      <p className="text-yellow-800">
                        <strong>Enhanced precision:</strong> Instead of directly adding the requested amount, our contracts measure the actual token balance change (delta) before and after the transfer. This guarantees that the exact amount received is what gets recorded, providing protection against tokens with transfer fees, rebasing mechanisms, or other non-standard behaviors. The contract now also explicitly verifies that tokens were actually received by checking for a non-zero delta.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                  <h4 className="text-lg font-semibold mb-3">Viewing Your Lockbox Contents</h4>
                  <p className="mb-4">
                    The contract provides a comprehensive view function that allows only you, the valid Lockbox owner, to see all assets contained in your Lockbox:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">getFullLockbox</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> tokenId<span style="color:#faf089;">)</span>
    <span style="color:#63b3ed;">external</span>
    <span style="color:#63b3ed;">view</span>
    <span style="color:#63b3ed;">returns</span> <span style="color:#faf089;">(</span>
        <span style="color:#d6bcfa;">uint256</span> bagETH,
        BaggedERC20[] <span style="color:#63b3ed;">memory</span> erc20Tokens,
        BaggedNFT[] <span style="color:#63b3ed;">memory</span> nfts
    <span style="color:#faf089;">)</span>
<span style="color:#faf089;">{</span>
    _requireExists<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span>;
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>_erc721.ownerOf<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span> != msg.sender<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> NotOwner<span style="color:#faf089;">()</span>;
    
    <span style="color:#a0aec0;">// Return ETH amount</span>
    bagETH = _baggedETH[tokenId];
    
    <span style="color:#a0aec0;">// Return all ERC20 tokens with balances</span>
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">storage</span> tokenAddresses = _erc20TokenAddresses[tokenId];
    erc20Tokens = <span style="color:#63b3ed;">new</span> BaggedERC20[]<span style="color:#faf089;">(</span>tokenAddresses.length<span style="color:#faf089;">)</span>;
    
    <span style="color:#63b3ed;">for</span> <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> i; i < tokenAddresses.length; <span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
        <span style="color:#d6bcfa;">address</span> tokenAddr = tokenAddresses[i];
        <span style="color:#d6bcfa;">uint256</span> bal = _erc20Balances[tokenId][tokenAddr];
        erc20Tokens[i] = BaggedERC20<span style="color:#faf089;">(</span>tokenAddr, bal<span style="color:#faf089;">)</span>;
        <span style="color:#63b3ed;">unchecked</span> <span style="color:#faf089;">{</span> ++i; <span style="color:#faf089;">}</span>
    <span style="color:#faf089;">}</span>
    
    <span style="color:#a0aec0;">// Return all contained NFTs</span>
    <span style="color:#a0aec0;">// [...NFT enumeration logic...]</span>
<span style="color:#faf089;">}</span>` }} />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                  <h4 className="text-lg font-semibold mb-3">Gas optimizations</h4>
                  <p className="mb-4">
                    The contract includes numerous gas optimizations to minimize transaction costs:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Simplified ETH storage:</strong> Using a direct uint256 mapping for ETH balances instead of a struct reduces gas costs</li>
                    <li><strong>Unchecked increments:</strong> Loop counters use unchecked blocks where overflow is impossible, saving gas on increment operations</li>
                    <li><strong>Complete storage cleanup:</strong> When asset balances reach zero, all associated storage is deleted to earn gas refunds</li>
                    <li><strong>Swap and pop pattern:</strong> Efficient array item removal that maintains O(1) complexity instead of shifting elements</li>
                    <li><strong>Conditional safe minting:</strong> Uses regular _mint for EOA addresses and _safeMint only for contract recipients</li>
                    <li><strong>Minimal storage:</strong> Storage is carefully structured to minimize blockchain storage costs</li>
                  </ul>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mt-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// Example of swap-and-pop pattern for efficient array management</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">_removeERC20Token</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> tokenId, <span style="color:#d6bcfa;">address</span> tokenAddress<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> <span style="color:#faf089;">{</span>
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">storage</span> tokenAddresses = _erc20TokenAddresses[tokenId];
    <span style="color:#d6bcfa;">uint256</span> len = tokenAddresses.length;
    <span style="color:#63b3ed;">for</span> <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> i; i < len; <span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
        <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>tokenAddresses[i] == tokenAddress<span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
            <span style="color:#a0aec0;">// Swap with last element</span>
            tokenAddresses[i] = tokenAddresses[len - 1];
            <span style="color:#a0aec0;">// Remove last element</span>
            tokenAddresses.pop();
            <span style="color:#63b3ed;">break</span>;
        <span style="color:#faf089;">}</span>
        <span style="color:#63b3ed;">unchecked</span> <span style="color:#faf089;">{</span> ++i; <span style="color:#faf089;">}</span> 
    <span style="color:#faf089;">}</span>
<span style="color:#faf089;">}</span>` }} />
                  </div>
                </div>
              </section>

              <section id="soulbound-nature" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Soulbound Nature</h2>
                <p className="mb-6">
                  Lockboxes are "soulbound" to the wallet they are minted to, meaning they cannot be transferred to other wallets. 
                  This crucial security feature ensures your assets remain safely within your ownership and cannot be stolen or transferred away.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">EIP-5192 Standard Implementation</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <p className="text-blue-800">
                      <strong>What is EIP-5192?</strong> EIP-5192 is the Ethereum Improvement Proposal that standardizes 
                      "soulbound" or non-transferable tokens. This standard allows applications to easily identify which NFTs 
                      are permanently bound to their current owner.
                      <a href="https://eips.ethereum.org/EIPS/eip-5192" target="_blank" rel="noopener noreferrer" className="ml-2 underline">
                        Read the EIP-5192 specification
                      </a>
                    </p>
                  </div>
                  
                  <p className="mb-4">
                    The Lockx contract implements the EIP-5192 standard through the IERC5192 interface:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// ERC-5192 Soulbound standard interface</span>
<span style="color:#63b3ed;">interface</span> <span style="color:#68d391;">IERC5192</span> <span style="color:#faf089;">{</span>
    <span style="color:#a0aec0;">/// Emitted exactly once when a token becomes locked (non-transferable).</span>
    <span style="color:#63b3ed;">event</span> <span style="color:#68d391;">Locked</span>(<span style="color:#d6bcfa;">uint256</span> tokenId);

    <span style="color:#a0aec0;">/// Emitted if a token ever becomes unlocked (not used, but must be declared for compliance).</span>
    <span style="color:#63b3ed;">event</span> <span style="color:#68d391;">Unlocked</span>(<span style="color:#d6bcfa;">uint256</span> tokenId);

    <span style="color:#a0aec0;">/// MUST always return true for every existing Lockbox.</span>
    <span style="color:#63b3ed;">function</span> <span style="color:#68d391;">locked</span>(<span style="color:#d6bcfa;">uint256</span> tokenId) <span style="color:#63b3ed;">external</span> <span style="color:#63b3ed;">view</span> <span style="color:#63b3ed;">returns</span> (<span style="color:#d6bcfa;">bool</span>);
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  
                  <p className="mb-4">
                    When a Lockbox is minted, it's immediately marked as locked and an EIP-5192 <code>Locked</code> event is emitted:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-6">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// During minting, the NFT is marked as locked</span>
<span style="color:#d6bcfa;">uint256</span> tokenId = _tokenIdCounter.current<span style="color:#faf089;">()</span>;
_tokenIdCounter.increment<span style="color:#faf089;">()</span>;

_safeMint<span style="color:#faf089;">(</span>to, tokenId<span style="color:#faf089;">)</span>;
<span style="color:#63b3ed;">emit</span> Locked<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span>; <span style="color:#a0aec0;">// EIP-5192 Locked event</span>
initialize<span style="color:#faf089;">(</span>tokenId, lockxPublicKey<span style="color:#faf089;">)</span>;` }} />
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Transfer Prevention</h3>
                  <p className="mb-4">
                    The core of the soulbound mechanism is the overridden <code>_transfer</code> function, which prevents any 
                    transfers of Lockboxes:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">/// Disable any transfer—soul‐bound enforcement.</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">_transfer</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">address</span>, <span style="color:#d6bcfa;">address</span>, <span style="color:#d6bcfa;">uint256</span><span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> <span style="color:#63b3ed;">pure</span> <span style="color:#63b3ed;">override</span> <span style="color:#faf089;">{</span>
    <span style="color:#e53e3e;">revert</span> TransfersDisabled<span style="color:#faf089;">()</span>;
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  
                  <p className="mb-4">
                    This simple but powerful override ensures that no standard transfer function can move a Lockbox from its original owner's wallet. 
                    All transfer attempts will immediately revert with a <code>TransfersDisabled</code> error.
                  </p>
                  
                  <p className="mb-4">
                    The contract also implements the required <code>locked</code> function, which confirms that a token is non-transferrable:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">/**
 * @notice Always returns true for existing Lockboxes (soul‐bound).
 * @param tokenId The ID of the Lockbox.
 * @return Always true.
 * @dev Reverts if token does not exist.
 */</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">locked</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> tokenId<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">external</span> <span style="color:#63b3ed;">view</span> <span style="color:#63b3ed;">override</span> <span style="color:#63b3ed;">returns</span> <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">bool</span><span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>!_exists<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">))</span> <span style="color:#e53e3e;">revert</span> NonexistentToken<span style="color:#faf089;">()</span>;
    <span style="color:#63b3ed;">return</span> <span style="color:#63b3ed;">true</span>;
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  </div>
                  
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Interface Detection</h3>
                  <p className="mb-4">
                    To ensure applications can detect that Lockboxes implement the EIP-5192 soulbound standard, the contract
                    includes the interface detection method:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-6">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">supportsInterface</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">bytes4</span> interfaceId<span style="color:#faf089;">)</span>
    <span style="color:#63b3ed;">public</span> <span style="color:#63b3ed;">view</span> <span style="color:#63b3ed;">override</span><span style="color:#faf089;">(</span>ERC721, ERC721Enumerable<span style="color:#faf089;">)</span>
    <span style="color:#63b3ed;">returns</span> <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">bool</span><span style="color:#faf089;">)</span>
<span style="color:#faf089;">{</span>
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>interfaceId == 0xb45a3c0e<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">return</span> <span style="color:#63b3ed;">true</span>; <span style="color:#a0aec0;">// IERC5192</span>
    <span style="color:#63b3ed;">return</span> <span style="color:#63b3ed;">super</span>.supportsInterface<span style="color:#faf089;">(</span>interfaceId<span style="color:#faf089;">)</span>;
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  
                  <p className="mb-4">
                    This enables wallets, marketplaces, and other applications to detect and appropriately handle the soulbound
                    nature of Lockboxes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="text-lg font-semibold mb-3">Marketplace Protection</h4>
                    <p>
                      The soulbound nature prevents Lockboxes from being listed or sold on NFT marketplaces. 
                      Unlike regular NFTs, your Lockbox cannot be accidentally listed for sale or transferred to another wallet, 
                      ensuring your assets remain securely in your control.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                    <h4 className="text-lg font-semibold mb-3">Theft Prevention</h4>
                    <p>
                      Even if your wallet's private key is compromised, an attacker cannot transfer your Lockbox to another wallet. 
                      This provides an additional layer of security beyond standard NFTs, as the attacker would also need your Lockx 
                      signing key to access the assets within your bag.
                    </p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 mb-8">
                  <h4 className="text-lg font-semibold mb-3">Why Soulbound Matters</h4>
                  <p className="mb-4">
                    The soulbound property creates a fundamental security improvement by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Preventing social engineering attacks that trick users into transferring NFTs</li>
                    <li>Eliminating the risk of approvals that could allow third parties to move your NFT</li>
                    <li>Creating a permanent bond between your wallet and your Create new Lockbox</li>
                    <li>Requiring both wallet access AND signature verification for any asset withdrawals</li>
                    <li>Ensuring your assets remain accessible even if marketplaces or frontends go offline</li>
                  </ul>
                </div>
              </section>

              <section id="multi-asset" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Multi-Asset Support</h2>
                <p className="mb-6">
                  Lockboxes are designed to securely hold multiple types of digital assets simultaneously within a single NFT. 
                  This creates a unified "digital safe deposit box" for your assets, all represented in your wallet as one NFT.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Supported Asset Types</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-semibold">ETH</h4>
                      </div>
                      <p className="text-sm">Native ETH with full wei precision (10^18)</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 100 2h2a1 1 0 100-2H4z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-semibold">ERC20 Tokens</h4>
                      </div>
                      <p className="text-sm">Any ERC20-compatible token with native precision</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-semibold">NFTs (ERC721)</h4>
                      </div>
                      <p className="text-sm">Individual NFTs can be stored inside your Lockbox</p>
                    </div>
                  </div>
                  
                  <p className="mb-6">
                    All these asset types can be stored within a single Lockbox, creating a consolidated view of your 
                    digital assets in one place.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Batch Management</h3>
                  <p className="mb-4">
                    Lockx allows for efficient batch operations, enabling you to deposit or withdraw multiple assets in a 
                    single transaction. This significantly reduces gas costs and simplifies asset management.
                  </p>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2">Batch deposit operations</h4>
                  <p className="mb-3">
                    The batch deposit function allows simultaneous deposit of ETH, ERC20 tokens, and NFTs with a single 
                    transaction. Here's how the contract handles different asset types:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// Batch deposit function with support for ETH, ERC20 tokens, and NFTs</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">batchDeposit</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">uint256</span> amountETH,
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">calldata</span> tokenAddresses,
    <span style="color:#d6bcfa;">uint256</span>[] <span style="color:#63b3ed;">calldata</span> tokenAmounts,
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">calldata</span> nftContracts,
    <span style="color:#d6bcfa;">uint256</span>[] <span style="color:#63b3ed;">calldata</span> nftTokenIds,
    <span style="color:#d6bcfa;">bytes32</span> referenceId
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">external</span> <span style="color:#63b3ed;">payable</span> <span style="color:#63b3ed;">nonReentrant</span> <span style="color:#faf089;">{</span>
    _requireOwnsBag<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span>;
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>msg.value != amountETH<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> ETHMismatch<span style="color:#faf089;">()</span>;
    _batchDeposit<span style="color:#faf089;">(</span>tokenId, amountETH, tokenAddresses, tokenAmounts, nftContracts, nftTokenIds, referenceId<span style="color:#faf089;">)</span>;
<span style="color:#faf089;">}</span>

<span style="color:#a0aec0;">// Internal batch deposit implementation</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">_batchDeposit</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">uint256</span> amountETH,
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">calldata</span> tokenAddresses,
    <span style="color:#d6bcfa;">uint256</span>[] <span style="color:#63b3ed;">calldata</span> tokenAmounts,
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">calldata</span> nftContracts,
    <span style="color:#d6bcfa;">uint256</span>[] <span style="color:#63b3ed;">calldata</span> nftTokenIds,
    <span style="color:#d6bcfa;">bytes32</span> referenceId
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">internal</span> <span style="color:#faf089;">{</span>
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>tokenAddresses.length != tokenAmounts.length || nftContracts.length != nftTokenIds.length<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> MismatchedInputs<span style="color:#faf089;">()</span>;
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>amountETH > 0<span style="color:#faf089;">)</span> _baggedETHs[tokenId].ethAmount += amountETH;

    <span style="color:#a0aec0;">// Process all ERC20 token deposits</span>
    <span style="color:#63b3ed;">for</span> <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> i; i < tokenAddresses.length; <span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
        _depositERC20<span style="color:#faf089;">(</span>tokenId, tokenAddresses[i], tokenAmounts[i], referenceId<span style="color:#faf089;">)</span>;
        <span style="color:#63b3ed;">unchecked</span> <span style="color:#faf089;">{</span> ++i; <span style="color:#faf089;">}</span>
<span style="color:#faf089;">}</span>

    <span style="color:#a0aec0;">// Process all NFT deposits</span>
    <span style="color:#63b3ed;">for</span> <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">uint256</span> i; i < nftContracts.length; <span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
        _depositERC721<span style="color:#faf089;">(</span>tokenId, nftContracts[i], nftTokenIds[i], referenceId<span style="color:#faf089;">)</span>;
        <span style="color:#63b3ed;">unchecked</span> <span style="color:#faf089;">{</span> ++i; <span style="color:#faf089;">}</span>
    <span style="color:#faf089;">}</span>
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  
                  <p className="mb-4">
                    The batch deposit process intelligently verifies all inputs and then processes each asset type using the 
                    appropriate deposit method. Notice the use of <code>unchecked</code> blocks for gas optimization in the loops.
                  </p>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2">Batch withdrawal operations</h4>
                  <p className="mb-3">
                    Similarly, the batch unbag function enables withdraw multiple assets in a single transaction,
                    with just one signature verification. This is especially valuable for efficient portfolio management:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#a0aec0;">// Single signature verification covers all assets</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">batchUnbag</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">bytes32</span> messageHash,
    <span style="color:#d6bcfa;">bytes</span> <span style="color:#63b3ed;">memory</span> signature,
    <span style="color:#d6bcfa;">uint256</span> amountETH,
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">calldata</span> tokenAddresses,
    <span style="color:#d6bcfa;">uint256</span>[] <span style="color:#63b3ed;">calldata</span> tokenAmounts,
    <span style="color:#d6bcfa;">address</span>[] <span style="color:#63b3ed;">calldata</span> nftContracts,
    <span style="color:#d6bcfa;">uint256</span>[] <span style="color:#63b3ed;">calldata</span> nftTokenIds,
    <span style="color:#d6bcfa;">address</span> recipient,
    <span style="color:#d6bcfa;">bytes32</span> referenceId,
    <span style="color:#d6bcfa;">uint256</span> signatureExpiry
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">external</span> <span style="color:#63b3ed;">nonReentrant</span> <span style="color:#faf089;">{</span>
    <span style="color:#a0aec0;">// Validate key parameters</span>
    _requireOwnsBag<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span>;
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>block.timestamp > signatureExpiry<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> SignatureExpired<span style="color:#faf089;">()</span>;
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>recipient == <span style="color:#d6bcfa;">address</span><span style="color:#faf089;">(</span>0<span style="color:#faf089;">))</span> <span style="color:#e53e3e;">revert</span> ZeroAddress<span style="color:#faf089;">()</span>;
    
    <span style="color:#a0aec0;">// Verify signature with all batch data</span>
    <span style="color:#d6bcfa;">bytes</span> <span style="color:#63b3ed;">memory</span> data = <span style="color:#63b3ed;">abi</span>.encode<span style="color:#faf089;">(</span>
    tokenId, amountETH, tokenAddresses, tokenAmounts, 
    nftContracts, nftTokenIds, recipient, referenceId, 
    msg.sender, signatureExpiry
<span style="color:#faf089;">)</span>;
verifySignature<span style="color:#faf089;">(</span>tokenId, messageHash, signature, <span style="color:#d6bcfa;">address</span><span style="color:#faf089;">(</span>0<span style="color:#faf089;">)</span>, OperationType.BATCH_UNBAG, data<span style="color:#faf089;">)</span>;

<span style="color:#a0aec0;">// Process ETH withdrawal</span>
<span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>amountETH > 0<span style="color:#faf089;">)</span> <span style="color:#faf089;">{</span>
        <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>_baggedETHs[tokenId].ethAmount < amountETH<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> InsufficientETH<span style="color:#faf089;">()</span>;
    _baggedETHs[tokenId].ethAmount -= amountETH;
    <span style="color:#faf089;">(</span><span style="color:#d6bcfa;">bool</span> success, <span style="color:#faf089;">)</span> = <span style="color:#63b3ed;">payable</span><span style="color:#faf089;">(</span>recipient<span style="color:#faf089;">)</span>.call<span style="color:#faf089;">{</span>value: amountETH<span style="color:#faf089;">}</span><span style="color:#faf089;">(</span><span style="color:#f6e05e;">""</span><span style="color:#faf089;">)</span>;
        <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>!success<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> ETHTransferFailed<span style="color:#faf089;">()</span>;
<span style="color:#faf089;">}</span>

    <span style="color:#a0aec0;">// Process all ERC20 token withdrawals</span>
    <span style="color:#a0aec0;">// [...ERC20 withdrawal logic...]</span>
    
    <span style="color:#a0aec0;">// Process all NFT withdrawals</span>
    <span style="color:#a0aec0;">// [...NFT withdrawal logic...]</span>
    
    emit Unbagged<span style="color:#faf089;">(</span>tokenId, referenceId<span style="color:#faf089;">)</span>;
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  
                  <h4 className="text-lg font-semibold mt-4 mb-2">Key benefits of batch operations</h4>
                  <p className="mb-3">
                    The multi-asset batch operations provide several important advantages:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                    <li><strong>Gas efficiency:</strong> Batch operations significantly reduce total gas costs compared to individual transactions</li>
                    <li><strong>Simplified management:</strong> Deposit or withdraw multiple assets with a single transaction</li>
                    <li><strong>Unified security:</strong> All operations are protected by the same signature verification process</li>
                    <li><strong>Asset diversity:</strong> Handle ETH, any ERC20 token, and any ERC721 NFT simultaneously</li>
                    <li><strong>Portfolio rebalancing:</strong> Easily adjust your asset allocation in a single transaction</li>
                    <li><strong>Optimized loops:</strong> Uses unchecked blocks for gas optimization in loops with array bounds guarantees</li>
                  </ul>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 className="text-lg font-semibold mb-2">Gas optimization note</h4>
                    <p className="text-sm text-yellow-800">
                      Due to current Ethereum gas transaction limits, we recommend limiting batch operations to no more than 3 different 
                      assets in a single transaction. Exceeding this number may approach block gas limits, especially when transferring 
                      multiple NFTs which require more complex storage operations.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <h3 className="text-lg font-semibold mb-2">Wallet Representation</h3>
                  <p className="text-blue-800">
                    Your Lockbox appears directly in your wallet, representing all contained assets. This provides a seamless 
                    user experience where all your stored assets are visible as a single NFT in your wallet, while still maintaining 
                    the highest security standards.
                  </p>
                </div>
              </section>

              <section id="security-benefits" className="mb-8 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Security Benefits</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
              </section>

              <section id="wallet-attacks" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Wallet Attack Protection</h2>
                <p className="mb-6">
                  Lockboxes provide significant security benefits by using a separate signing key that's distinct from your wallet's 
                  private key. This architecture creates an additional security layer that protects your assets even if your wallet 
                  becomes compromised.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Defense Against Common Wallet Attacks</h3>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Wallet Private Key Compromise</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> If an attacker obtains your wallet's private key, they typically gain complete control over all assets in that wallet.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Attacker can transfer all ETH and tokens</li>
                            <li>Attacker can approve malicious contracts to spend tokens</li>
                            <li>All NFTs can be immediately transferred away</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Attacker sees the Lockbox but cannot transfer it (soulbound)</li>
                            <li>Cannot withdraw assets without the separate Lockx signing key</li>
                            <li>All assets inside the bag remain secure</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx requires a separate signature from the Lockx key linked to your NFT for any asset withdrawal. Even with your wallet's private key, an attacker cannot generate valid signatures from your Lockx key.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Signature Phishing</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> Attackers trick users into signing malicious transactions or permissions that drain their wallets or grant access to their assets.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>One malicious signature can drain entire wallet</li>
                            <li>Users often can't tell what they're signing</li>
                            <li>Approvals may enable ongoing asset theft</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Assets in Lockx bags require specific EIP-712 signatures</li>
                            <li>Phished wallet signatures cannot withdraw from bags</li>
                            <li>Separate Lockx key is needed for withdrawals</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> The Lockx contract only accepts properly formatted EIP-712 signatures from the specific Lockx key associated with your NFT. Signatures from your wallet key alone are insufficient.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Seed Phrase Compromise</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> If attackers obtain your wallet's seed phrase, they can recreate your wallet and gain full access to all assets.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Complete wallet takeover on any device</li>
                            <li>All assets can be transferred immediately</li>
                            <li>No secondary verification required</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Seed phrase doesn't reveal Lockx signing key</li>
                            <li>Assets within bags remain secured</li>
                            <li>Attacker would need access to both your wallet and Lockx key</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx keys are generated separately from your wallet and can be stored securely through our key fraction technology or Self custody options. A compromised seed phrase doesn't expose these keys.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Blind Signature Attacks</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> Attackers trick users into signing messages with obscured or misleading contents, which are actually authorizations for asset transfers.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Users may sign messages without understanding implications</li>
                            <li>Signatures might authorize unexpected operations</li>
                            <li>Unclear what action is being authorized</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>EIP-712 provides structured, human-readable data</li>
                            <li>Operations specify exact amounts and recipients</li>
                            <li>Two-key architecture requires both wallet and Lockx key signatures</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx uses EIP-712 typed data signatures that clearly display the operation being performed, including specific assets, amounts, and recipients. Additionally, the separation of wallet and Lockx keys provides protection even if one signature is compromised.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg overflow-hidden mt-8 mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Malware and RAT Trojan Attacks</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> Sophisticated trojans like StilachiRAT target cryptocurrency wallets to steal private keys and credentials from wallet extensions such as MetaMask.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Malware can extract keys from memory</li>
                            <li>Private keys stored in browser extensions can be compromised</li>
                            <li>Once extracted, all wallet assets are immediately at risk</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Lockx keys are ephemeral - never persistently stored</li>
                            <li>Keys generated on-demand and immediately destroyed after use</li>
                            <li>Compromised wallet doesn't expose assets inside soulbound NFT</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx protects against advanced malware by using ephemeral key technology. Even if trojans compromise your main wallet's private key, they cannot access assets inside your soulbound Lockbox since withdrawals require the secondary ephemeral key that's generated on-demand and immediately destroyed after use.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Wallet Drainers and Scam Sites</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> Wallet drainer scams trick users into connecting their wallets to malicious websites that rapidly drain all assets through token approvals or direct transfers.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Entire wallet can be emptied instantly</li>
                            <li>All approvals can be exploited</li>
                            <li>Drainer scripts operate automatically</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Lockboxes are soulbound and cannot be transferred</li>
                            <li>All withdrawals require separate EIP-712 signatures</li>
                            <li>Contract interactions with Lockboxes are strictly limited</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockboxes are soulbound and cannot be drained or transferred from the wallet they are bound to. All content inside requires a separate interaction with the Lockx smart contract, which requires a separate EIP-712 typed signature. All bagged assets remain secure inside the Lockbox.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Malicious Airdrops</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> Attackers use malicious airdrops to send tokens with exploitative code that can drain wallets when users attempt to interact with the tokens.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Unexpected tokens appear in wallet</li>
                            <li>Interacting with tokens triggers malicious code</li>
                            <li>Can lead to approval exploits or wallet draining</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Lockboxes only accept deposits from the token owner</li>
                            <li>No automatic token acceptance mechanism</li>
                            <li>Malicious tokens remain outside the secure bag</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockboxes only accept deposits from the token owner, so the contents cannot be compromised by malicious airdrops or random tokens. This provides an extra layer of security against increasingly common airdrop-based attack vectors.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Proprietary Wallet Infrastructure Risks</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Traditional Vulnerability:</strong> Reliance on proprietary wallet infrastructure creates single points of failure, exposes users to vendor-specific risks, and may limit interoperability.</p>
                      
                      <div className="flex mb-4">
                        <div className="w-1/2 pr-4 border-r border-gray-200">
                          <h5 className="font-semibold text-red-700 mb-2">Without Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Vendor-specific security risks</li>
                            <li>Service outages may restrict access to assets</li>
                            <li>Limited wallet compatibility and migration options</li>
                          </ul>
                        </div>
                        <div className="w-1/2 pl-4">
                          <h5 className="font-semibold text-green-700 mb-2">With Lockx Protection:</h5>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Works with any ERC-721 compatible wallet</li>
                            <li>Simple dual-key multisignature system</li>
                            <li>Open and accessible smart contract architecture</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Unlike complex systems that rely on proprietary wallet infrastructure, Lockx assets are held inside a soulbound NFT adhering to the ERC-721 standard that any Ethereum Self custody wallet can own. The dual-key multisignature system is simple to interact with, and the smart contract is public and always accessible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="contract-attacks" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Contract Attack Protection</h2>
                <p className="mb-6">
                  The Lockx smart contracts implement numerous security measures to protect against common attack vectors that 
                  target smart contracts. These protections ensure the integrity and security of the contract's operations.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Smart Contract Security Measures</h3>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Reentrancy Attacks</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Vulnerability:</strong> In a reentrancy attack, a malicious contract calls back into the victim contract before the first invocation is complete, potentially manipulating state and draining assets.</p>
                      
                      <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                        <pre dangerouslySetInnerHTML={{ __html: `// Protection against reentrancy attacks
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">unbagETH</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">bytes32</span> messageHash,
    <span style="color:#d6bcfa;">bytes</span> <span style="color:#90cdf4;">memory</span> signature,
    <span style="color:#d6bcfa;">uint256</span> amount,
    <span style="color:#d6bcfa;">address</span> recipient,
    <span style="color:#d6bcfa;">bool</span> burnToken,
    <span style="color:#d6bcfa;">bytes32</span> referenceId
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">public</span> <span style="color:#63b3ed;">nonReentrant</span> <span style="color:#faf089;">{</span>
    <span style="color:#a0aec0;">// ... function logic ...</span>
<span style="color:#faf089;">}</span>` }} />
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> All deposit and withdrawal functions in the Lockx contract use OpenZeppelin's <code>nonReentrant</code> modifier, which prevents reentrancy attacks by using a mutex pattern. This ensures that a function cannot be re-entered before its first invocation completes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Signature Replay Attacks</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Vulnerability:</strong> In a replay attack, a valid signature is reused to execute the same operation multiple times, potentially draining assets repeatedly.</p>
                      
                      <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                        <pre dangerouslySetInnerHTML={{ __html: `// Nonce management in the SignatureVerification contract
function verifySignature(
    uint256 tokenId,
    bytes32 messageHash,
    bytes memory signature,
    address newLockxPublicKey,
    OperationType opType,
    bytes memory data
) internal {
    // ... verification logic ...
    
    // Increment nonce after successful verification
    tokenData.nonce++;
    
    // ... additional logic ...
}` }} />
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx incorporates a nonce-based signature verification system. Each signature includes the current nonce value, and after verification, the nonce is incremented. This prevents the same signature from being used twice, as the nonce value would no longer match.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Transaction Ordering Manipulation</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Vulnerability:</strong> Attackers can observe pending transactions and insert their own transactions with higher gas prices to manipulate execution order for profit (front-running).</p>
                      
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h5 className="font-bold text-blue-800 mb-2">Traditional Risks:</h5>
                        <ul className="list-disc pl-6 text-blue-800">
                          <li>Front-running valuable transactions</li>
                          <li>Sandwich attacks on swap transactions</li>
                          <li>Racing to claim limited opportunities</li>
                        </ul>
                        <h5 className="font-bold text-blue-800 mt-3 mb-2">Lockx Protection:</h5>
                        <ul className="list-disc pl-6 text-blue-800">
                          <li>All operations require unique signatures</li>
                          <li>Operations are tied to specific recipients</li>
                          <li>No shared pools that can be manipulated</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx uses a direct asset mapping approach where each operation is explicitly authorized for a specific recipient with an exact amount. Transaction ordering cannot be exploited because each transaction's outcome is deterministic and not dependent on the state of a shared pool or global price.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg overflow-hidden mb-8">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                      <h4 className="font-bold text-red-800">Attack Scenario: Unauthorized Function Access</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="mb-4"><strong>Vulnerability:</strong> Without proper access controls, attackers might call sensitive functions to manipulate contract state or steal assets.</p>
                      
                      <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                        <pre dangerouslySetInnerHTML={{ __html: `// Access control in contract functions
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">unbagETH</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">bytes32</span> messageHash,
    <span style="color:#d6bcfa;">bytes</span> <span style="color:#90cdf4;">memory</span> signature,
    <span style="color:#d6bcfa;">uint256</span> amount,
    <span style="color:#d6bcfa;">address</span> recipient,
    <span style="color:#d6bcfa;">bool</span> burnToken,
    <span style="color:#d6bcfa;">bytes32</span> referenceId
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">public</span> <span style="color:#63b3ed;">nonReentrant</span> <span style="color:#faf089;">{</span>
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>ownerOf<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span> != msg.sender<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> NotOwner<span style="color:#faf089;">()</span>;
    
    <span style="color:#a0aec0;">// Verify the signature from the Lockx key</span>
    <span style="color:#d6bcfa;">bytes</span> <span style="color:#90cdf4;">memory</span> data = <span style="color:#63b3ed;">abi</span>.encode(amount, recipient, burnToken, referenceId);
    verifySignature(tokenId, messageHash, signature, <span style="color:#63b3ed;">address</span>(0), OperationType.UNBAG_ETH, data);
    
    <span style="color:#a0aec0;">// ... additional logic ...</span>
<span style="color:#faf089;">}</span>` }} />
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-yellow-800">
                          <strong>Security Mechanism:</strong> Lockx implements strict access controls on all functions. Deposit functions verify the caller owns the NFT. Withdrawal functions require both ownership verification and a valid signature from the Lockx key associated with the NFT, creating a dual-authorization requirement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </section>

              <section id="key-management" className="mb-8 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Key Management</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
              </section>

              <section id="key-fraction-tech" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Key Fraction Technology</h2>
                <p className="mb-6">
                  Lockx implements a unique key fraction technology that enhances security through a multi-party computation approach 
                  to key generation and management. This technology ensures private keys are never stored in their entirety—instead, 
                  they're deterministically derived when needed through a secure process.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                  <h3 className="text-lg font-semibold mb-2">Zero Trust Architecture</h3>
                  <p className="text-yellow-800">
                    Our key fraction technology implements zero trust principles. Lockx never stores complete private keys—not even 
                    temporarily. Keys are derived on-demand and immediately deleted from memory after use.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">How Key Fraction Technology Works</h3>
                  <ol className="list-decimal pl-6 space-y-4">
                    <li>
                      <p className="mb-2"><strong>User Authentication:</strong> You sign a unique message that includes a random "message key fraction" generated for your session.</p>
                    </li>
                    <li>
                      <p className="mb-2"><strong>Server-Side Key Fraction:</strong> Lockx generates a random key fraction that's encrypted and stored securely in Google Cloud KMS (Key Management Service). This is protected by Hardware Security Modules (HSM) with FIPS level 3 compliance for enterprise-grade security.</p>
                    </li>
                    <li>
                      <p className="mb-2"><strong>Ephemeral Key Derivation:</strong> When needed, your signature is combined with the server-side key fraction to deterministically derive the public/private key pair through a cryptographic hash function. This creates a unique, one-time-use signing key that exists only for the duration of the specific operation.</p>
                    </li>
                    <li>
                      <p className="mb-2"><strong>Expiring Signatures:</strong> All generated signatures have a short lifespan and include operation-specific data that prevents them from being reused for other purposes. This time-bound approach provides enhanced security by limiting the window of opportunity for potential attacks.</p>
                    </li>
                    <li>
                      <p className="mb-2"><strong>Immediate Cleanup:</strong> After the operation is completed, the derived private key is immediately removed from memory. Keys must be rederived for every operation, ensuring no persistent key material exists that could be compromised.</p>
                    </li>
                  </ol>

                  <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-3">Security Benefits</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>No complete private key is ever stored anywhere</li>
                      <li>Both user input (signature) and server-side fraction are required to derive the key</li>
                      <li>Server-side key fractions are encrypted at rest</li>
                      <li>Advanced plan users benefit from HSM protection for their key fractions</li>
                      <li>Key rotation supported for enhanced security</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Key Export & Recovery</h3>
                  <p className="mb-4">
                    Lockx provides you with the encrypted key fraction during setup, which you can securely store as a backup. 
                    This fraction is essential for key recovery and export:
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-4">
                    <h4 className="text-lg font-semibold mb-3">Key Export Process</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>When you need to export your private key, you'll need to provide:
                        <ul className="list-disc pl-6 mt-2">
                          <li>Your wallet signature</li>
                          <li>The encrypted key fraction you received during setup</li>
                          <li>Valid 2FA code as proof of ownership</li>
                        </ul>
                      </li>
                      <li>Once verified, Lockx temporarily reconstructs your private key for export</li>
                      <li>The key is securely delivered to you and immediately purged from our systems</li>
                    </ol>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h4 className="text-lg font-semibold mb-2">Key Ownership</h4>
                    <p className="text-blue-800">
                      Even though Lockx manages the key fraction technology, <strong>you always maintain ultimate ownership of your keys</strong>. 
                      You can export your complete key details whenever needed by proving ownership through our verification process.
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">2FA Protection</h3>
                  <p className="mb-4">
                    Lockx implements robust 2FA (Two-Factor Authentication) protection using the same trustless key derivation approach:
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-4">
                    <h4 className="text-lg font-semibold mb-3">Trustless TOTP Management</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Lockx creates TOTP (Time-based One-Time Password) secrets using the same trustless key derivation process used for Lockx key fractions</li>
                      <li>Like key fractions, TOTP secrets are never stored in their complete form anywhere</li>
                      <li>The 2FA code is required to decrypt associated Lockx key fractions and export them</li>
                      <li>Unlike traditional web2 systems, Lockx doesn't store any TOTP secrets - they are trustlessly derived on-demand</li>
                      <li>We verify the code against your authentication application to guarantee security</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold mb-3">Compatible Applications</h4>
                    <p className="mb-2">Lockx 2FA is compatible with industry-standard authenticator applications:</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="bg-white px-3 py-2 rounded border border-gray-200 flex items-center">
                        <span>Google Authenticator</span>
                      </div>
                      <div className="bg-white px-3 py-2 rounded border border-gray-200 flex items-center">
                        <span>Twilio Authy</span>
                      </div>
                      <div className="bg-white px-3 py-2 rounded border border-gray-200 flex items-center">
                        <span>Microsoft Authenticator</span>
                      </div>
                      <div className="bg-white px-3 py-2 rounded border border-gray-200 flex items-center">
                        <span>And other TOTP-compatible apps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="Self custody" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Self custody signing</h2>
                <p className="mb-6">
                  While Lockx provides a secure key fraction service, users can alternatively opt for complete Self custody of their keys. 
                  This option gives you full control and responsibility over the key management process.
                </p>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                  <h3 className="text-xl font-semibold mb-3">Self custody vs. Lockx key fractions</h3>
                  
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">Feature</th>
                        <th className="py-2 px-4 text-left">Lockx key fraction</th>
                        <th className="py-2 px-4 text-left">Self custody</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">Key storage</td>
                        <td className="py-2 px-4">Encrypted key fraction in KMS</td>
                        <td className="py-2 px-4">User's responsibility</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Security level</td>
                        <td className="py-2 px-4">Multi-party computation with 2FA</td>
                        <td className="py-2 px-4">Dependent on user's security measures</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Recovery</td>
                        <td className="py-2 px-4">Supported through recovery process</td>
                        <td className="py-2 px-4">User's responsibility</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Two-factor authentication</td>
                        <td className="py-2 px-4">Included</td>
                        <td className="py-2 px-4">Included</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Site/web app usage</td>
                        <td className="py-2 px-4">Unlimited</td>
                        <td className="py-2 px-4">Unlimited</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Using Self custody mode</h3>
                  <p className="mb-4">
                    To use Self custody mode for signing transactions, follow these steps:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Copy the JSON provided to you during your unbagging authentication process into Remix</li>
                    <li>Verify the parameters are correct</li>
                    <li>Sign into Remix with your secondary signer</li>
                    <li>Right click the file holding the JSON and click sign</li>
                    <li>Copy the signature provided in the terminal to the frontend modal</li>
                    <li>Click submit signature</li>
                  </ol>
                  
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-3">Interactive EIP-712 message builder</h4>
                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-500">EIP-712 typed data to sign</label>
                        <div className="flex space-x-2">
                          <button 
                            className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                            onClick={() => {
                              // Use a textarea element to allow copying the content
                              const textArea = document.createElement('textarea');
                              textArea.value = document.getElementById('eip712-data')?.innerText || '';
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              
                              // Show copied notification
                              const copyBtn = document.getElementById('copy-btn');
                              if (copyBtn) {
                                const originalText = copyBtn.innerText;
                                copyBtn.innerText = 'Copied!';
                                setTimeout(() => {
                                  copyBtn.innerText = originalText;
                                }, 2000);
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span id="copy-btn">Copy JSON</span>
                          </button>
                          <button 
                            className="text-xs bg-purple-600 text-white hover:bg-purple-700 py-1 px-2 rounded flex items-center"
                            onClick={async () => {
                              try {
                                setIsSigningMessage(true);
                                setSignError(null);
                                
                                // Check if wallet is connected
                                if (!isConnected) {
                                  // Show connecting message
                                  const statusElem = document.getElementById('wallet-status');
                                  if (statusElem) statusElem.innerText = 'Connecting wallet...';
                                  
                                  // Try to connect wallet
                                  try {
                                    await connectWallet('metamask');
                                  } catch (error: any) {
                                    setSignError(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
                                    setIsSigningMessage(false);
                                    return;
                                  }
                                }
                                
                                // Get data from the UI
                                const dataElem = document.getElementById('eip712-data');
                                if (!dataElem) {
                                  setSignError('Could not find EIP-712 data element');
                                  setIsSigningMessage(false);
                                  return;
                                }
                                
                                // Show signing message
                                const statusElem = document.getElementById('wallet-status');
                                if (statusElem) statusElem.innerText = 'Preparing EIP-712 data...';
                                
                                try {
                                  // Try to parse the content as JSON
                                  let eip712Message: string;
                                  const jsonContent = dataElem.textContent || dataElem.innerText;
                                  
                                  try {
                                    // Try to parse it directly as JSON
                                    const jsonData = JSON.parse(jsonContent);
                                    
                                    // IMPORTANT FIX: Ensure numeric fields are actually numbers, not strings
                                    // Convert all numeric fields to proper number types
                                    if (jsonData.message) {
                                      // Convert tokenId to number
                                      if (jsonData.message.tokenId !== undefined) {
                                        jsonData.message.tokenId = Number(jsonData.message.tokenId);
                                      }
                                      
                                      // Convert nonce to number
                                      if (jsonData.message.nonce !== undefined) {
                                        jsonData.message.nonce = Number(jsonData.message.nonce);
                                      }
                                      
                                      // Convert opType to number
                                      if (jsonData.message.opType !== undefined) {
                                        jsonData.message.opType = Number(jsonData.message.opType);
                                      }
                                    }
                                    
                                    // Ensure chainId is a number in the domain
                                    if (jsonData.domain && jsonData.domain.chainId !== undefined) {
                                      jsonData.domain.chainId = Number(jsonData.domain.chainId);
                                    }
                                    
                                    // Now use the corrected JSON with proper types
                                    eip712Message = JSON.stringify(jsonData);
                                  } catch (parseError) {
                                    
                                    // Create a placeholder message with default values
                                    const tokenIdStr = document.getElementById('tokenId-value')?.innerText || '123';
                                    const nonceStr = document.getElementById('nonce-value')?.innerText || '45';
                                    const opTypeStr = document.getElementById('opType-value')?.innerText || '1';
                                    const contractAddress = document.getElementById('contract-value')?.innerText || '0x1234...5678';
                                    
                                    // Convert string values to numbers for EIP-712 typing
                                    const tokenId = Number(tokenIdStr);
                                    const nonce = Number(nonceStr);
                                    const opType = Number(opTypeStr);
                                    
                                    
                                    // Create the domain, types and message
                                    const domain = {
                                      name: "Lockx",
                                      version: "1",
                                      chainId: 1, 
                                      verifyingContract: contractAddress
                                    };
                                    
                                    const types = {
                                      Operation: [
                                        { name: "tokenId", type: "uint256" },
                                        { name: "nonce", type: "uint256" },
                                        { name: "opType", type: "uint8" },
                                        { name: "dataHash", type: "bytes32" }
                                      ]
                                    };
                                    
                                    const dataHash = `0x${'0'.repeat(64)}`;
                                    
                                    const message = {
                                      tokenId, // Use number
                                      nonce,   // Use number
                                      opType,  // Use number
                                      dataHash
                                    };
                                    
                                    // Convert the message to JSON
                                    eip712Message = JSON.stringify({
                                      domain,
                                      types,
                                      primaryType: "Operation",
                                      message
                                    });
                                  }
                                  
                                  if (statusElem) statusElem.innerText = 'Requesting signature from wallet...';
                                  
                                  // Request signature using the wallet's signTypedData function if available, otherwise fall back to signMessage
                                  try {
                                    // Use the wallet's signTypedData function if available, otherwise fall back to signMessage
                                    const signature = window.ethereum && typeof (window.ethereum as any).request === 'function'
                                      ? await (window.ethereum as any).request({
                                          method: 'eth_signTypedData_v4',
                                          params: [address, eip712Message],
                                        })
                                      : await signMessage(eip712Message);
                                    
                                    
                                    // Display the signature in the signature display div
                                    const signatureDisplay = document.getElementById('signature-display');
                                    if (signatureDisplay) {
                                      signatureDisplay.innerText = signature;
                                      signatureDisplay.classList.add('border-green-200', 'bg-green-50');
                                    }
                                    
                                    if (statusElem) statusElem.innerText = 'Signature successfully generated!';
                                  } catch (error: any) {
                                    Sentry.captureException(error);
                                    setSignError(`Signing failed: ${error.message || 'Unknown error'}`);
                                    if (statusElem) statusElem.innerText = 'Signing failed';
                                  }
                                } catch (error: any) {
                                  Sentry.captureException(error);
                                  setSignError(`Error: ${error.message || 'Unknown error'}`);
                                } finally {
                                  setIsSigningMessage(false);
                                }
                              } catch (error: any) {
                                Sentry.captureException(error);
                                setSignError(`Error: ${error.message || 'Unknown error'}`);
                              } finally {
                                setIsSigningMessage(false);
                              }
                            }}
                            disabled={isSigningMessage}
                          >
                            {isSigningMessage ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7l-6.5 6.5M12.5 7h3v3" />
                                </svg>
                                Sign with Wallet
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <pre 
                          id="eip712-data" 
                          className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-48 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 hover:border-gray-300 border border-transparent transition-all"
                          onClick={handleJsonClick}
                        >
{`DOMAIN:
  name: "Lockx"
  version: "1"
  chainId: 1
  verifyingContract: 0x1234...5678

TYPE: Operation
  tokenId: uint256
  nonce: uint256
  opType: uint8
  dataHash: bytes32

VALUE:
  tokenId: 123
  nonce: 45
  opType: 1
  dataHash: [automatically generated from the parameters below]

OPERATION DATA (1):
  signatureExpiry: 1688654321 (expires: in 15 minutes)
  amount: 1000000000000000000 wei
  recipient: 0xabcd...ef01
`}
                        </pre>
                        
                        <div className="absolute top-2 right-2 text-xs text-gray-500 opacity-70 pointer-events-none">
                          
                        </div>
                      </div>
                      
                      {/* Wallet status display */}
                      <div className="mt-2 text-xs">
                        <div className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                          {isConnected ? `Connected: ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` : 'Wallet: Not connected'}
                        </div>
                        <div id="wallet-status" className="text-xs text-blue-600 h-5"></div>
                        {signError && (
                          <div className="text-xs text-red-600 mt-1">
                            {signError}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800">
                        <span className="font-semibold">Note:</span> Your signature will be valid for 15 minutes from the time it was generated.
                        <span className="ml-1 font-semibold">Generated during signature request</span>
                      </div>
                      
                      

                      <div className="px-0 pt-3 pb-0">
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-700">Generated signature:</label>
                          </div>
                          <div id="signature-display" className="p-3 border border-gray-200 rounded bg-gray-50 text-xs font-mono overflow-auto max-h-24 whitespace-pre-wrap">
                            No signature generated yet. Click "Sign with Wallet" above to generate a signature.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                    <h4 className="text-lg font-semibold mb-2">Important Security Notice</h4>
                    <p className="text-red-800">
                      With Self custody, you are fully responsible for securing your private keys. Loss of your private key will result 
                      in permanent loss of access to your bagged assets. Make sure to implement proper backup procedures.
                    </p>
                  </div>
                </div>
              </section>

              <section id="key-rotation" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Key Rotation</h2>
                <p className="mb-6">
                  Lockx implements a key rotation mechanism that allows users to update the Lockx public key associated with their bag.
                  This enhances security by allowing periodic updates of authorization keys.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Rotation Process</h3>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#9B9B9B;">/**
 * @dev Rotates the Lockbox public key associated with a Lockbox, after signature verification.
 * @param tokenId The ID of the Lockbox for which to rotate the key.
 * @param messageHash The message hash that the Lockbox private key signed.
 * @param signature The Lockbox private key signature for verification.
 * @param newPublicKey The new Lockbox public key.
 * @param referenceId An external reference for off-chain tracking.
 * @param signatureExpiry UNIX timestamp until which the signature is valid.
 */</span>
<span style="color:#63b3ed;">function</span> <span style="color:#68d391;">rotateLockxKey</span><span style="color:#faf089;">(</span>
    <span style="color:#d6bcfa;">uint256</span> tokenId,
    <span style="color:#d6bcfa;">bytes32</span> messageHash,
    <span style="color:#d6bcfa;">bytes</span> <span style="color:#90cdf4;">memory</span> signature,
    <span style="color:#d6bcfa;">address</span> newPublicKey,
    <span style="color:#d6bcfa;">bytes32</span> referenceId,
    <span style="color:#d6bcfa;">uint256</span> signatureExpiry
<span style="color:#faf089;">)</span> <span style="color:#63b3ed;">external</span> <span style="color:#faf089;">{</span>
    _requireOwnsBag<span style="color:#faf089;">(</span>tokenId<span style="color:#faf089;">)</span>;
    <span style="color:#63b3ed;">if</span> <span style="color:#faf089;">(</span>block.timestamp > signatureExpiry<span style="color:#faf089;">)</span> <span style="color:#e53e3e;">revert</span> SignatureExpired<span style="color:#faf089;">()</span>;

    <span style="color:#d6bcfa;">bytes</span> <span style="color:#90cdf4;">memory</span> data = <span style="color:#63b3ed;">abi</span>.encode<span style="color:#faf089;">(</span>tokenId, newPublicKey, referenceId, msg.sender, signatureExpiry<span style="color:#faf089;">)</span>;
    <span style="color:#63b3ed;">verifySignature</span><span style="color:#faf089;">(</span>tokenId, messageHash, signature, newPublicKey, OperationType.ROTATE_KEY, data<span style="color:#faf089;">)</span>;
    <span style="color:#63b3ed;">emit</span> KeyRotated<span style="color:#faf089;">(</span>tokenId, referenceId<span style="color:#faf089;">)</span>;
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  <p className="text-gray-700 mt-4">
                    Key rotation requires a valid signature from the current Lockx public key, ensuring that only authorized parties can update keys.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Parameters & Flow</h3>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-3">Key Parameters</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>tokenId</strong>: Identifies the specific Lockbox whose key is being rotated</li>
                      <li><strong>messageHash</strong>: A cryptographic hash of the message that was signed by the current Lockx private key</li>
                      <li><strong>signature</strong>: The cryptographic signature generated by the current Lockx private key</li>
                      <li><strong>newPublicKey</strong>: The address of the new public key that will replace the current one</li>
                      <li><strong>referenceId</strong>: An external identifier for tracking and audit purposes</li>
                      <li><strong>signatureExpiry</strong>: A timestamp that defines when the signature becomes invalid, adding time-bound security</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Rotation Security Flow</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Ownership verification: Ensures only the owner of the Lockbox can initiate key rotation</li>
                    <li>Signature expiry check: Verifies the rotation request hasn't expired, preventing replay attacks</li>
                    <li>Data bundling: Combines all critical parameters into a single data structure for verification</li>
                    <li>Signature verification: Confirms the operation is authorized by the current Lockx key</li>
                    <li>Key update: Replaces the old Lockx public key with the new one once verification succeeds</li>
                    <li>Event emission: Records the key rotation for transparency and audit purposes</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold mb-3">Security Best Practices</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Rotate keys periodically (e.g., every 90 days)</li>
                    <li>Immediately rotate keys if you suspect any compromise</li>
                    <li>Use hardware wallets or secure key management solutions for Lockx keys</li>
                    <li>Maintain secure backups of your keys</li>
                  </ul>
                </div>
              </section>

              <section id="security" className="mb-8 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Security & Authorization</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
              </section>

              <section id="eip-712" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">EIP-712 Signatures</h2>
                <p className="mb-6">
                  Lockx uses EIP-712 signatures for secure transaction authorization. This standard provides a better user experience
                  by showing users a structured and readable message when signing transactions.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">What is EIP-712?</h3>
                  <p className="mb-4">
                    EIP-712 is an Ethereum Improvement Proposal that defines a standard for signing typed structured data. 
                    It improves upon simple message signing by:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Providing human-readable data in signing interfaces</li>
                    <li>Enabling structured data with types</li>
                    <li>Preventing signature replay across different domains</li>
                    <li>Ensuring consistent hashing across implementations</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Implementation in Lockx</h3>
                  <p className="mb-4">
                    In our contracts, EIP-712 is implemented through OpenZeppelin's EIP712 contract:
                  </p>
                  <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-4">
                    <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#9B9B9B;">// Type hash for operations</span>
<span style="color:#d6bcfa;">bytes32</span> <span style="color:#63b3ed;">private</span> <span style="color:#63b3ed;">constant</span> <span style="color:#68d391;">OPERATION_TYPEHASH</span> =
    <span style="color:#68d391;">keccak256</span><span style="color:#faf089;">(</span><span style="color:#f6ad55;">"Operation(uint256 tokenId,uint256 nonce,uint8 opType,bytes32 dataHash)"</span><span style="color:#faf089;">)</span>;

<span style="color:#63b3ed;">constructor</span><span style="color:#faf089;">(</span><span style="color:#d6bcfa;">address</span> erc721Address<span style="color:#faf089;">)</span>
    <span style="color:#68d391;">EIP712</span><span style="color:#faf089;">(</span><span style="color:#f6ad55;">"Lockx"</span>, <span style="color:#f6ad55;">"1"</span><span style="color:#faf089;">)</span>
<span style="color:#faf089;">{</span>
    _erc721 = <span style="color:#68d391;">ERC721</span><span style="color:#faf089;">(</span>erc721Address<span style="color:#faf089;">)</span>;
<span style="color:#faf089;">}</span>` }} />
                  </div>
                  <p>
                    When a user initiates an operation like withdraw assets, the frontend will:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Construct the typed data according to EIP-712 specification</li>
                    <li>Request the user to sign this data with their wallet</li>
                    <li>Submit the signature along with the operation parameters to the contract</li>
                    <li>The contract will verify the signature before executing the operation</li>
                  </ol>
                </div>

                <div className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                  <pre dangerouslySetInnerHTML={{ __html: `<span style="color:#9B9B9B;">// EIP-712 domain and types</span>
<span style="color:#63b3ed;">const</span> <span style="color:#68d391;">domain</span> = <span style="color:#faf089;">{</span>
    <span style="color:#79b8ff;">name</span>: <span style="color:#f6ad55;">"Lockx"</span>,
    <span style="color:#79b8ff;">version</span>: <span style="color:#f6ad55;">"1"</span>,
    <span style="color:#79b8ff;">chainId</span>: <span style="color:#68d391;">chainId</span>,
    <span style="color:#79b8ff;">verifyingContract</span>: <span style="color:#68d391;">LOCKX_CONTRACT_ADDRESS</span>
<span style="color:#faf089;">}</span>;

<span style="color:#63b3ed;">const</span> <span style="color:#68d391;">types</span> = <span style="color:#faf089;">{</span>
    <span style="color:#79b8ff;">Operation</span>: <span style="color:#faf089;">[</span>
        <span style="color:#faf089;">{</span> <span style="color:#79b8ff;">name</span>: <span style="color:#f6ad55;">"tokenId"</span>, <span style="color:#79b8ff;">type</span>: <span style="color:#f6ad55;">"uint256"</span> <span style="color:#faf089;">}</span>,
        <span style="color:#faf089;">{</span> <span style="color:#79b8ff;">name</span>: <span style="color:#f6ad55;">"nonce"</span>, <span style="color:#79b8ff;">type</span>: <span style="color:#f6ad55;">"uint256"</span> <span style="color:#faf089;">}</span>,
        <span style="color:#faf089;">{</span> <span style="color:#79b8ff;">name</span>: <span style="color:#f6ad55;">"opType"</span>, <span style="color:#79b8ff;">type</span>: <span style="color:#f6ad55;">"uint8"</span> <span style="color:#faf089;">}</span>,
        <span style="color:#faf089;">{</span> <span style="color:#79b8ff;">name</span>: <span style="color:#f6ad55;">"dataHash"</span>, <span style="color:#79b8ff;">type</span>: <span style="color:#f6ad55;">"bytes32"</span> <span style="color:#faf089;">}</span>
    <span style="color:#faf089;">]</span>
<span style="color:#faf089;">}</span>;` }} />
                </div>
              </section>

              <section id="security-measures" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Security Measures</h2>
                <p className="mb-6">
                  Lockx contracts implement multiple security measures to protect user assets and ensure secure operations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">Reentrancy Protection</h3>
                    <p>
                      All functions that transfer assets implement OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">EIP-712 Compliance</h3>
                    <p>
                      EIP-712 signatures with nonces prevent replay attacks and ensure only authorized operations.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">Transfer Restrictions</h3>
                    <p>
                      Bags cannot be transferred, preventing unauthorized movement of assets.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3">EIP-5192 Compliance</h3>
                    <p>
                      All Lockboxes implement the EIP-5192 soulbound standard, ensuring they remain permanently locked to their owners.
                    </p>
                  </div>
                </div>

              </section>

              <section id="direct-interaction" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Direct contract interaction</h2>
                <p className="mb-6">
                  All Lockx contracts are verified on Etherscan, allowing for direct interaction with the contracts without requiring our frontend interface. This provides an additional layer of security and accessibility, ensuring your assets remain accessible even if our website becomes unavailable.
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Benefits of verified contracts</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Full transparency of contract code</li>
                    <li>Direct interaction with contract functions</li>
                    <li>Ability to verify transaction details</li>
                    <li>Independence from Lockx frontend</li>
                    <li>Permanent access to your assets</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-3">Interacting with Lockx contracts on Etherscan</h3>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-lg font-semibold mb-3">Step 1: Find the verified contract</h4>
                    <p className="mb-4">Navigate to Etherscan and search for the Lockx contract address:</p>
                    <div className="bg-blue-50 p-4 rounded mb-4 flex items-center">
                      <span className="font-mono text-blue-700 break-all mr-2">0x6cC1ACE12eAafbBedB41560Cc48856f3f4fcd6b9</span>
                    </div>
                    <p>Alternatively, you can search by name "Lockx" in the Etherscan search bar, but be sure to verify you're interacting with the official contract.</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-lg font-semibold mb-3">Step 2: Navigate to the "Contract" tab</h4>
                    <p className="mb-2">Once on the contract page, click on the "Contract" tab to see the verified contract code and interact with it.</p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex space-x-4 border-b border-gray-300 pb-2">
                        <div className="px-3 py-1 rounded bg-white border border-gray-300">Transactions</div>
                        <div className="px-3 py-1 rounded bg-purple-100 border border-purple-300 font-semibold">Contract</div>
                        <div className="px-3 py-1 rounded bg-white border border-gray-300">Events</div>
                        <div className="px-3 py-1 rounded bg-white border border-gray-300">Analytics</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-lg font-semibold mb-3">Step 3: Use the "Read Contract" section</h4>
                    <p className="mb-4">The "Read Contract" section lets you query contract state without spending gas:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong>getFullLockbox(tokenId)</strong> - View all assets stored in your Lockbox</li>
                      <li><strong>locked(tokenId)</strong> - Verify if a token is soulbound (always returns true)</li>
                      <li><strong>ownerOf(tokenId)</strong> - Check the owner of a specific Lockbox</li>
                      <li><strong>getActiveLockxPublicKeyForToken(tokenId)</strong> - Get the current signing key for a bag</li>
                      <li><strong>getNonce(tokenId)</strong> - Get the current nonce for a bag (needed for signatures)</li>
                    </ul>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="text-yellow-800">
                        <strong>Note:</strong> Some functions are restricted to the token owner. If you're not connected with the owner's wallet, you'll receive an error when calling these functions.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <h4 className="text-lg font-semibold mb-3">Step 4: Use the "Write Contract" section</h4>
                    <p className="mb-4">The "Write Contract" section allows you to modify contract state by executing transactions:</p>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Connect your wallet</h5>
                      <p className="mb-2">Before interacting with write functions, connect your wallet by clicking "Connect to Web3" at the top of the Write Contract section.</p>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Common write functions</h5>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>depositETH(tokenId, referenceId)</strong> - Deposit ETH into your bag</li>
                        <li><strong>depositERC20(tokenId, tokenAddress, amount, referenceId)</strong> - Deposit ERC20 tokens</li>
                        <li><strong>depositERC721(tokenId, nftContract, nftTokenId, referenceId)</strong> - Deposit NFTs</li>
                        <li><strong>unbagETH(...)</strong> - Withdraw ETH (requires signature)</li>
                        <li><strong>unbagERC20(...)</strong> - Withdraw ERC20 tokens (requires signature)</li>
                        <li><strong>unbagERC721(...)</strong> - Withdraw NFTs (requires signature)</li>
                        <li><strong>rotateLockxKey(...)</strong> - Change the signing key (requires signature)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <p className="text-red-800">
                        <strong>Important:</strong> For functions requiring signatures (unbag operations), you'll need to generate EIP-712 signatures. This typically requires using our frontend or signing utilities like eth-sig-util. The process is complex and requires precise formatting of message data.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold mb-3">Example: Checking your lockbox contents</h4>
                    <p className="mb-4">Let's walk through the process of checking what's in your Lockbox:</p>
                    
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Navigate to the "Read Contract" section</li>
                      <li>Find the <code>getFullLockbox</code> function</li>
                      <li>Enter your token ID in the input field</li>
                      <li>Click the "Query" button</li>
                      <li>The function will return three values:
                        <ul className="list-disc pl-6 mt-2">
                          <li><strong>bagETH</strong>: The amount of ETH stored (in wei)</li>
                          <li><strong>erc20Tokens</strong>: Array of token addresses and balances</li>
                          <li><strong>nfts</strong>: Array of NFT contracts and token IDs</li>
                        </ul>
                      </li>
                    </ol>
                    
                    <div className="mt-4 bg-black rounded-lg overflow-hidden">
                      <div className="bg-gray-800 px-4 py-2 text-white text-sm font-semibold">Example Response</div>
                      <pre className="p-4 text-green-400 text-xs overflow-x-auto">
{`[bagETH]: 1000000000000000000
[erc20Tokens]: [
  [0]: {
    tokenAddress: 0x6B175474E89094C44Da98b954EedeAC495271d0F,
    balance: 50000000000000000000
  }
]
[nfts]: [
  [0]: {
    nftContract: 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D,
    nftTokenId: 1234
  }
]`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
                  <h3 className="text-xl font-semibold mb-3">Advanced tips for Etherscan interaction</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Using the correct network</h4>
                      <p className="text-sm">Make sure you're using Ethereum Mainnet when accessing the Lockx contract. The contract is deployed on Ethereum Mainnet only, and the verification and interaction features will only work with the correct network selected.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Reading events</h4>
                      <p className="text-sm">Check the "Events" tab to see all emitted events from the contract, including deposits, withdrawals, and key rotations. This can be useful for tracking activity or verifying operations.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Decoding transaction input data</h4>
                      <p className="text-sm">When viewing a transaction involving the Lockx contract, Etherscan will automatically decode the function call and parameters due to contract verification, making it easier to understand what each transaction does.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-1">Verifying contract addresses</h4>
                      <p className="text-sm">Always double-check contract addresses by comparing them with official sources. The verified contract will have a green checkmark and the "Contract" label next to the address on Etherscan.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="faq-support" className="mb-8 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">FAQ & Support</h2>
                <div className="h-1 w-20 bg-blue-600 mb-8"></div>
              </section>

              <section id="faq" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      What is Lockx?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        Lockx is a secure platform for managing digital assets (ETH, ERC20 tokens, and NFTs) through smart contract "bags" that provide enhanced security features through EIP-712 signatures.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      What does Lockx protect against?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        Lockx is built to defend against many common Self custody wallet attacks:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-3 text-gray-700">
                        <li>
                          <strong>Wallet private key or seed phrase compromise:</strong><br />
                          If your wallet's private key or seed phrase is compromised, attackers could easily transfer or drain your funds. With Lockx, your assets are held inside a soulbound NFT, and withdrawals require a separate Lockx signature derived from an ephemeral key. Even if your main key is compromised, the Lockbox and its bagged assets remain secure. The attacker would need BOTH your compromised wallet keys AND the secondary Lockbox key. With 2FA protection, an attacker would also need access to your mobile device to recreate your secondary key. You can quickly transfer your assets from your Lockbox to a non-compromised wallet.
                        </li>
                        <li>
                          <strong>Signature phishing defense:</strong><br />
                          Lockx only accepts structured EIP‑712 signatures generated by your Lockx key—not your wallet's key alone. EIP-712 authenticates individual details such as token amounts, addresses, recipients, chain IDs, and expirations, ensuring operation data remains transparent and providing additional security against phished signatures.
                        </li>
                        <li>
                          <strong>Wallet drainers and scam sites:</strong><br />
                          Lockboxes are soulbound and cannot be drained or transferred from the wallet they are bound to. All content inside requires a separate interaction with the Lockx smart contract, which requires a separate EIP-712 typed signature. All bagged assets remain secure inside the Lockbox, allowing you to quickly transfer them to a non-compromised wallet if needed.
                        </li>
                        <li>
                          <strong>Malicious airdrops:</strong><br />
                          Lockboxes only accept deposits from the token owner, so the contents cannot be compromised by malicious airdrops or random tokens.
                        </li>
                        <li>
                          <strong>Problems with proprietary wallet infrastructure:</strong><br />
                          Unlike complex systems that rely on proprietary wallet infrastructure, Lockx assets are held inside a soulbound NFT adhering to the ERC-721 standard that any Ethereum Self custody wallet can own. The dual-key multisignature system is simple to interact with, and the smart contract is public and always accessible, ensuring no reliance on centralized infrastructure. It has no tokenomics and no dependence on off-chain signals, reducing friction even further.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      How does key fraction technology protect my assets?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        Key fraction technology ensures that no complete private key is ever stored anywhere. The key is derived on-demand from a 
                        combination of your signature (which only you can produce) and an encrypted server-side key fraction. This means that an 
                        attacker would need both your wallet and access to our secure cloud infrastructure to compromise your keys. After use, the 
                        derived private key is immediately deleted from memory. Additionally, we hash resulting signatures with time-based expiry 
                        parameters to invalidate signatures after a set period, preventing long-term vulnerability. Two-factor authentication (2FA) 
                        is required to access the decrypted fractions during key recreation and the signing process, adding another critical layer of security.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      Who has control of my Lockx keys?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        With our key fraction technology, control is shared. You maintain control through your wallet's signature capability, 
                        and Lockx stores a necessary key fraction. Neither party alone can derive the private key. A valid 2FA code is also required 
                        for any key derivation process, and the 2FA system itself is built using key fraction technology, ensuring no single entity 
                        has access to complete keys. Alternatively, you can choose Self custody mode, where you manage your keys entirely without Lockx involvement.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      What happens if Lockx goes offline?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        The Lockx smart contracts are completely autonomous and operate independently on the blockchain. Even if Lockx services become 
                        unavailable, your assets remain safe and accessible. You can:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                        <li>Interact directly with the smart contracts using blockchain tools</li>
                        <li>Generate your own EIP-712 signatures if you have your private key (either Self custody or exported)</li>
                        <li>Use alternative frontends or tools developed by the community</li>
                      </ul>
                      <p className="mt-2 text-gray-700">
                        This contract independence is why we offer Self custody options and always provide the ability to export your keys if using our hosted key fraction technology, which eliminates any dependency on our servers for key generation and validation.
                        We always recommend exporting and securely backing up your keys.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      Does Lockx have its own token?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        No, Lockx does not have its own token or tokenomics. We operate on a platform fee model, charging one-time fees for key management services. This approach allows us to provide consistent service without token price volatility.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      How does the signature verification work?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        Lockx uses EIP-712 signatures to authorize operations. Each Lockbox has an associated public key that must sign operations like withdrawals. 
                        This provides an additional layer of security beyond just owning the NFT. Lockx key fractions are convenient because they automate 
                        key derivation and signing technology with 2FA integration. With the Lockx key fraction keys option, a valid 2FA code combined with a valid 
                        wallet signature will recreate the original key used to sign for operations, streamlining the entire process. Alternatively, in 
                        Self custody mode, you can sign transactions yourself by receiving the EIP-712 JSON format to sign with external signing tools like Remix.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      Can I transfer my Lockx bag to another wallet?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        No, Lockx bags are non-transferable by design. This is a security feature that prevents unauthorized movement of the assets contained within the bag.
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <button className="w-full text-left p-4 focus:outline-none font-medium">
                      What happens if I lose access to my Lockbox public key and private key?
                    </button>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700">
                        If using our hosted key fraction technology, we ensure all key fractions are encrypted and stored with all relevant backups. As long as you have paid the platform fee and can verify ownership of your wallet private key, encrypted fraction, and 2FA code, you will always be able to recover your keys.
                        If using Self custody, you are responsible for managing your own keys and we unfortunately cannot help you recover your Self custody keys.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="troubleshooting" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>
                <p className="mb-6">
                  We're here to help if you encounter any issues. Here are some common problems and their solutions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>If you're having trouble connecting your wallet, make sure you're using the correct wallet provider and network. Try refreshing the page or using a different browser if issues persist.</li>
                  <li>If you're unable to sign transactions, check your wallet's transaction history to see if there are any pending transactions that need to be addressed first.</li>
                  <li>For any issues with the signature verification process, try refreshing your session and attempting again. If problems persist, please contact our support team for assistance.</li>
                  <li>For "Injected Provider" errors, ensure that your wallet extension is properly installed and updated to the latest version.</li>
                  <li>When interacting with dApps, make sure to grant the necessary permissions when prompted by your wallet.</li>
                  <li>If your wallet keeps disconnecting from the dApp, try enabling the "Always connect to this site" option in your wallet settings.</li>
                  <li>Ensure 2FA is setup and fully confirmed before accessing sensitive functions.</li>
                </ul>
              </section>

              <section id="contact" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-4">Contact Support</h2>
                <p className="mb-6">
                  Our support team is ready to assist you with any questions or issues you may encounter.
                </p>
                <p className="mb-6">
                richard@lockx.net
                </p>
              </section>
            </div>
          </main>
        </div>
      </Container>
    </div>
  );
}