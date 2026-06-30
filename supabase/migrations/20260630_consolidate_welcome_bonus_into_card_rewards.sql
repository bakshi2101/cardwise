-- Migration: consolidate welcome bonus data into card_rewards as the single source of truth.
--
-- Welcome bonus data was split across two tables: card_rewards (reward_event_type=
-- 'welcome_bonus', used by the Path B recommendation engine) and card_benefits
-- (benefit_type='welcome_bonus', used by the card detail page). 22 cards only had
-- it in card_benefits, so their welcome bonus was invisible to Path B; 3 cards had
-- it in both (values matched, confirmed duplicate entry, not conflicting data).
--
-- This migration inserts the missing rows into card_rewards, then removes
-- benefit_type='welcome_bonus' from card_benefits entirely so there is one source.
--
-- Run this in the Supabase SQL editor (Database -> SQL Editor -> New query).

-- 'general' category id, matching the convention used by all existing
-- card_rewards welcome_bonus rows (id: 8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f)

INSERT INTO card_rewards
  (card_id, category_id, reward_type, reward_event_type, absolute_value_aed,
   display_label, notes, source_url, last_verified_date, is_active)
VALUES
  ('01e72932-8a77-447a-86ca-6c7161290608', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 1000,
   'Welcome Offer — 10,000 SHARE Points + Joining Fee Reversal', 'Earn 10,000 SHARE Points (worth AED 1,000 at 10 SHARE Points = AED 1) AND a reversal of the AED 1,575 Joining Fee, both on spending AED 40,000 within the first 3 months. Requires AED 40,000 spend within first 3 months of card issuance. Joining Fee Reversal value (AED 1,575) is in addition to the AED 1,000 points value. Credited within 6-8 weeks of meeting the criteria.', 'https://www.emiratesnbd.com/en/cards/credit-cards/share-visa-private-credit-card', CURRENT_DATE, true),
  ('049d2750-c50d-4c1f-a44e-ed83f0af78bc', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', 350,
   'Welcome bonus up to AED 350', 'Welcome bonus of up to AED 350 when applying on select digital channels. Apply via select digital channels. T&Cs apply.', 'https://www.adcb.com/en/personal/cards/credit-cards/essential-cashback-credit-card.aspx?lang=en', CURRENT_DATE, true),
  ('1020144e-2348-4a46-8bfd-ef22890d8d41', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 2500,
   'Up to 2,500 dnata Points Welcome Bonus', 'Up to 2,500 dnata points: 1,000 points on payment of joining fee + 1,500 points on retail spend of AED 25,000 within the first 3 billing statements. New cardholders. 1,000 points on joining fee payment. Additional 1,500 on AED 25,000 spend within first 3 billing statements.', 'https://www.emiratesnbd.com/en/cards/credit-cards/dnata-world-credit-card', CURRENT_DATE, true),
  ('14bafe9c-78ac-4889-a88d-4c7ad0a5229b', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', 750,
   'talabat Credit Welcome Bonus', 'Up to AED 750 welcome bonus as talabat credit for new ADCB customers. AED 200 for existing ADCB cardholders. Credited within 90 days of card issuance. Min spend AED 5,000 within 45 days. New customers only (AED 200 for existing). Digital channels only.', 'https://www.adcb.com/en/personal/cards/credit-cards/talabat-credit-card.aspx?lang=en', CURRENT_DATE, true),
  ('15d372a6-9af6-4568-8af8-31b65e05bc20', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 2500,
   'Welcome Bonus — Up to 25,000 UPoints', 'New cardholders can earn up to 25,000 UPoints as a welcome bonus (worth up to AED 2,500 at 10 UPoints = AED 1). Subject to spend conditions within an initial period — verify exact terms with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/u-by-emaar-infinite-credit-card', CURRENT_DATE, true),
  ('24a37507-e7e7-49e3-bc7e-fa331411df66', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'voucher', 'welcome_bonus', 500,
   'Signup Promo — Majid Al Futtaim Mall eGift Card (AED 500)', 'One-time signup promotion: Majid Al Futtaim Mall eGift Card by YOUGotaGift worth AED 500 for new cardholders. One-time new cardholder promotion — verify current availability with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/share-visa-infinite-credit-card', CURRENT_DATE, true),
  ('24a37507-e7e7-49e3-bc7e-fa331411df66', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 1000,
   'Welcome Offer — 10,000 SHARE Points + Joining Fee Reversal', 'Earn 10,000 SHARE Points (worth AED 1,000 at 10 SHARE Points = AED 1) AND a reversal of the AED 1,575 Joining Fee, both on spending AED 40,000 within the first 3 months. Requires AED 40,000 spend within first 3 months of card issuance. Joining Fee Reversal value (AED 1,575) is in addition to the AED 1,000 points value.', 'https://www.emiratesnbd.com/en/cards/credit-cards/share-visa-infinite-credit-card', CURRENT_DATE, true),
  ('25c2e049-d94a-44ef-8bb5-d131eda9e6b5', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', NULL,
   'Welcome cashback bonus', 'AED 750 cashback for new Mashreq credit card customers; AED 200 for existing customers. Requires AED 5,000 spend within first 2 months of card issuance. Credited by end of 3rd month after issuance. New customers: AED 5,000 spend in first 2 months. Existing customers (held Mashreq card in last 6 months): AED 200, same spend requirement. One-time; credited by end of month 3 after issuance.', 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/', CURRENT_DATE, true),
  ('503dc10e-8bbf-4727-9312-14bbf68a9900', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', 365,
   'Welcome cashback of AED 365', 'AED 365 cashback credited within 90 days of card issuance. Requires min AED 5,000 spend within first 45 days. Min spend AED 5,000 within 45 days of card issuance. One-time benefit.', 'https://www.adcb.com/en/personal/cards/credit-cards/365-cashback-card.aspx?lang=en', CURRENT_DATE, true),
  ('53578327-8f9c-49d1-902f-d45f9f2131d4', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'voucher', 'welcome_bonus', 250,
   'Signup Promo — Majid Al Futtaim Mall eGift Card (AED 250)', 'One-time signup promotion: Majid Al Futtaim Mall eGift Card by YOUGotaGift worth AED 250 for new cardholders. One-time new cardholder promotion — verify current availability with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/share-visa-platinum-credit-card', CURRENT_DATE, true),
  ('5d2b89b8-681a-4cb1-a81c-82c53a296a43', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 300,
   'Welcome Offer — 3,000 Darna Points', 'Earn 3,000 Darna Points (worth AED 300 at 10 Darna Points = AED 1) on spending AED 15,000 within the first 3 months. Requires AED 15,000 spend within first 3 months of card issuance.', 'https://www.emiratesnbd.com/en/cards/credit-cards/darna-visa-signature-credit-card', CURRENT_DATE, true),
  ('5d2b89b8-681a-4cb1-a81c-82c53a296a43', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'voucher', 'welcome_bonus', 350,
   'Signup Promo — YOUGotaGift HappyYOU Card (AED 350)', 'One-time signup promotion: YOUGotaGift HappyYOU Card worth AED 350 for new cardholders. One-time new cardholder promotion — verify current availability with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/darna-visa-signature-credit-card', CURRENT_DATE, true),
  ('7cdf45a9-2752-4a1c-b97e-e9183147ca95', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 1000,
   'Up to 1,000 dnata Points Welcome Bonus', 'Up to 1,000 dnata points: 500 points on payment of joining fee + 500 points on retail spend of AED 10,000 within the first 3 billing statements. New cardholders. 500 points credited on joining fee payment. Additional 500 on AED 10,000 spend within first 3 billing statements.', 'https://www.emiratesnbd.com/en/cards/credit-cards/dnata-platinum-credit-card', CURRENT_DATE, true),
  ('87f37bc6-a40d-4246-9bb5-9400f8d1952a', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'miles', 'welcome_bonus', 10000,
   '200,000 Etihad Guest Miles Welcome Bonus', 'Earn 200,000 Etihad Guest Miles on first card spend within 90 days of card issuance. New cardholders only. New cardholders only. First spend must occur within 90 days of card issuance.', 'https://www.emiratesnbd.com/en/cards/credit-cards/etihad-guest-visa-elevate', CURRENT_DATE, true),
  ('9130eaec-f5c5-4b28-907d-8636bf8fb3ec', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', NULL,
   'Welcome cashback bonus', 'AED 2,500 cashback for new Mashreq credit card customers; AED 500 for existing customers. Requires AED 9,000 spend within first 2 months of card issuance. New customers: AED 9,000 spend in first 2 months = AED 2,500. Existing customers: AED 500, same spend. One-time; credited by end of month 3 after issuance.', 'https://www.mashreq.com/en/uae/neo/cards/credit-cards/', CURRENT_DATE, true),
  ('9659dd8f-1fb9-4e00-bd39-897700eb1da1', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'voucher', 'welcome_bonus', 350,
   'Signup Promo — Majid Al Futtaim Mall eGift Card (AED 350)', 'One-time signup promotion: Majid Al Futtaim Mall eGift Card by YOUGotaGift worth AED 350 for new cardholders. One-time new cardholder promotion — verify current availability with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/share-visa-signature-credit-card', CURRENT_DATE, true),
  ('9659dd8f-1fb9-4e00-bd39-897700eb1da1', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 500,
   'Welcome Offer — 5,000 SHARE Points', 'Earn 5,000 SHARE Points (worth AED 500 at 10 SHARE Points = AED 1) on spending AED 25,000 within the first 3 months. Requires AED 25,000 spend within first 3 months of card issuance.', 'https://www.emiratesnbd.com/en/cards/credit-cards/share-visa-signature-credit-card', CURRENT_DATE, true),
  ('99361b01-9c0f-4155-8bf2-45b0b5baca89', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', NULL,
   'Shukran Welcome Bonus', 'Welcome bonus: 1,200 Shukrans (UAE Nationals new); 1,000 Shukrans (UAE Residents new); 200 Shukrans (existing ADCB cardholders). Credited within 120 days. Min AED 8,000 spend in 60 days of card issuance.', 'https://www.adcb.com/en/personal/cards/credit-cards/shukran-credit-card?lang=en', CURRENT_DATE, true),
  ('a4acddfe-986a-4432-b887-5ae3858e3598', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'miles', 'welcome_bonus', 750,
   'Welcome Bonus — 75,000 Voyager Miles', 'Earn 75,000 Voyager Miles (≈AED 750 portal value) on spending AED 35,000 within the first 3 billing statements. Requires AED 35,000 spend within first 3 billing statements. Source: tcpdfs/ENBD voyager_tncs_booklet_world.pdf', 'https://www.emiratesnbd.com/en/cards/credit-cards/voyager-world-credit-card', CURRENT_DATE, true),
  ('bb9bb1d8-1d28-44e5-8fb3-ec89d5c72cc5', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', 500,
   'AED 500 Joining Cashback', 'AED 500 credited as cashback to statement on AED 5,000 spend within first 2 calendar months. New ENBD credit cardholders only (or card closed 12+ months prior). New ENBD credit card customers only. Must spend AED 5,000 in first 60 days. Not available on supplementary cards. Credited to primary card statement.', 'https://www.emiratesnbd.com/en/cards/credit-cards/noon-one-visa-credit-card', CURRENT_DATE, true),
  ('c3842f60-6724-4680-8e38-40e17b8a141f', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'miles', 'welcome_bonus', 1500,
   'Welcome Bonus — 150,000 Voyager Miles', 'Earn 150,000 Voyager Miles (≈AED 1,500 portal value) on spending AED 70,000 within the first 3 billing statements. Requires AED 70,000 spend within first 3 billing statements. Source: tcpdfs/ENBD voyager_tncs_booklet_world_elite.pdf', 'https://www.emiratesnbd.com/en/cards/credit-cards/voyager-world-elite-credit-card', CURRENT_DATE, true),
  ('c3d147c9-9de6-4bf6-9bdc-014b2bf30c08', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'voucher', 'welcome_bonus', 500,
   'Signup Promo — YOUGotaGift HappyYOU Card (AED 500)', 'One-time signup promotion: YOUGotaGift HappyYOU Card worth AED 500 for new cardholders. One-time new cardholder promotion — verify current availability with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/darna-visa-infinite-credit-card', CURRENT_DATE, true),
  ('c3d147c9-9de6-4bf6-9bdc-014b2bf30c08', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'points', 'welcome_bonus', 1500,
   'Welcome Offer — Up to 15,000 Darna Points', 'Earn up to 15,000 Darna Points (worth up to AED 1,500 at 10 Darna Points = AED 1): 7,500 points on payment of the joining fee + 7,500 points on spending AED 20,000 within the first 3 months. Requires joining fee payment + AED 20,000 spend within first 3 months of card issuance.', 'https://www.emiratesnbd.com/en/cards/credit-cards/darna-visa-infinite-credit-card', CURRENT_DATE, true),
  ('e6099b97-5c18-45e3-918c-13284d50fe3c', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'miles', 'welcome_bonus', 3000,
   '60,000 Etihad Guest Miles Welcome Bonus', 'Earn 60,000 Etihad Guest Miles on first card spend within 90 days of card issuance. New cardholders only. New cardholders only. First spend must occur within 90 days of card issuance.', 'https://www.emiratesnbd.com/en/cards/credit-cards/etihad-guest-visa-inspire', CURRENT_DATE, true),
  ('eb72d967-aba1-465c-beeb-b501f9c553a9', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'cashback', 'welcome_bonus', 500,
   'Welcome Bonus — AED 500 (Prime Members)', 'AED 250 Amazon Reward Points on spending AED 10,000 on retail purchases + AED 250 on spending AED 2,500 in foreign currency transactions, both within 60 days of card issuance. Prime members only. AED 10,000 retail spend + AED 2,500 FX spend within 60 days. Prime membership required. Source: https://www.emiratesislamic.ae/en/Personal-Banking/Cards/credit-cards/amazon-credit-card', 'https://www.emiratesislamic.ae/en/Personal-Banking/Cards/credit-cards/amazon-credit-card', CURRENT_DATE, true),
  ('fe22ddc2-b6c7-49cb-a70a-288e2454860d', '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f', 'voucher', 'welcome_bonus', 250,
   'Signup Promo — YOUGotaGift HappyYOU Card (AED 250)', 'One-time signup promotion: YOUGotaGift HappyYOU Card worth AED 250 for new cardholders. One-time new cardholder promotion — verify current availability with bank.', 'https://www.emiratesnbd.com/en/cards/credit-cards/darna-select-visa-credit-card', CURRENT_DATE, true);

-- Remove welcome bonus rows from card_benefits now that card_rewards is the
-- single source (covers all 25 cards: the 22 migrated above + the 3 that already
-- had a matching card_rewards row).
DELETE FROM card_benefits WHERE benefit_type = 'welcome_bonus';
