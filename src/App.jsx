import React, { createElement, useEffect, useReducer } from 'react';
import {
  cancelPremiumSubscription,
  changeAccountPassword,
  loadAdminSummary,
  loadAccountProgress,
  loadCourse,
  loadProgress,
  resetCourse,
  restoreSession,
  saveCourse,
  saveProgress,
  setAccountSession,
  resetAccountPassword,
  requestPasswordReset,
  resendVerificationEmail,
  signInAccount,
  signOutAccount,
  signUpAccount,
  startPremiumCheckout,
  updateEmailReminderPreference,
  verifyEmailAddress,
  verifyPremiumPayment,
} from './services/progressRepository.js';
import { getAdMarkup, loadAdSense } from './services/ads.js';
import {
  cleanMeaning,
  createQuizOptions,
  selectReviewWords,
  uniqueWordsByIkwerre,
} from './services/lessonContent.js';
/* ===== COURSE CONTENT =====
   Check spellings and meanings with Ikwerre speakers before expanding the course. */
const LANGNAME = 'Ikwerre';
const U = [];
const COURSE=`# Greetings and replies
Ibọla = Good Morning
Ehi-he-oma = Good Afternoon
Mgbe-da-chi-oma = Good Evening
Abu-ochi = Good night
Ndanụ = How are you
Ọka-Ze-la Ọbu-ru-oma = I am alright, fine
# Ways to greet
Meka = A male greeting to another male
Anụ Meka = A male greeting to other male
ibi-ala = Greeting to welcome a visitor
iya-la = Greeting to welcome a resident or a neighbour.
Mbe-kụ-lem-ọh = greeting used for more than one person.
Anụ-zim = Greeting for more than one or group of persons
Anụ-meka = Greeting for more than one or group of persons.
Anụ-zim-wee = Greeting generally for groups of people in a meeting
Anụ-zim-mụ-ọh = General greeting for people while in the meeting.
i-zim = Greeting to a person to inquire well being.
Anụ-yọ-tọi = A group greeting to those in the meeting/ gathering
Anụ-bọla = Usually for group of person one's met in the day time
Ele-riya-nma = Greeting to women in a meeting or gathering.
Anụ werụm-oh = Greetings to men by women
Ọyọ-yọ = Response by woman to a man's greeting while in meeting or gathering.
# More greetings
iya-la = Welcome
idu-la = Have you arrived?
Nda-gi-nụ-ize-me-rụ = How was your journey
ibia Kwarụ-kụ oma = Hope you come in good cause
Nda-nụ, Ọbọ-chi-nụ-la = Hello, how is it Today?
Ọbụ-rụ-ọma = Fine
En-chelem, Ehi-shirike = Hope you are physically alright
Ọwee, meka = Yes thank you
Mbe-kụ-lem,gi kọr-ma = Congratulations
Meka-sụ-badụ-oma = Thank you
ishi-da-welem = Congratulations On your safe Delivering
En-chelem-ehi-buru-balam-gi-oma = Hope you are getting well
Ọwee-nzim-ko-oma = Yes am fine, am alright
Ọge-mati-Ehi-yọ-Ọ-burụọma = You will soon recover
isee = Amen
Chiọkike-yo-gwọr = God will help you get alright
Nkam-eha-oburụ-oma = Are you well?
Ọwee,chiọkike-bụ-e ze = Yes/no
# Farewells
Laa-kọ-oma = Good bye
Meka-leru-Anya = Bye, Thank you
ize-oma = Safe Journey
im elem = Ok, thank you
Bekwụ nde-ọrụ = Greet your people
Nụ-lam = Ok, I will
Nche-rụm = I believe
Ọwee-meka = Yes, thank
Arọ-burụ-oma = Work is Going well?
Ọma kwa = Yes is well
# Asking after family
Nụ-ọla-nda-merụ = How is papa
Nda-bụrụ-ọma = He is fine
Nụ-ọla-nne-merụ = How is mama
Nne-bụrụ-ọma = She is fine
Nwere-gi-merụ-la = How is your wife
Nụ-ọla-rụmụ-merụ = How are your Children
Rụmụm-bụrụ-ọma = They are fine
Nụ-ọla-izhim-nụ = How is your Husband
Nụ-ọla-wene-riya = How about your sister
Wenem-riya,burụ-oma = She is doing well
Nụ-ọla,wenerụka = How about your brother
wene-rụka Ọbụrụ.ọma = He is alright
# Days of the week
Ọbọchi = Days
Ọbọchi isee = Five days in a week's
Ọbọchi Riagbọ = Monday
Ọbọchi Asaragbọ = Tuesday
Ọbọchi Eberi = Wednesday
Ọbọchi Mmakara = Thursday
Ọbọchi Nnim = Friday
# Family
Nda = Father
Nne = Mother
Nda-ọkani = Grandfather
Nne-Ọkani = Grandmother
Wene-Ndam-rụka = Uncle
Wene Ndam-riya = Aunt
Nwọm-Rụka = Son
Wene-Rụka = Brother
Wene-Riya = Sister
Nwọ Riya Nwena = Niece
Ruka-wene-Ndam = First cousin (male)
Riya-wene-Ndam = First cousin (female)
Ruka-Wenem = Nephew
Nwọ-Nwọ-ọkani = Second cousins
izhi-Nne = Step-Father
Nwere-Nda = Step-Mother
Ọgom-ruka = Father- in- Law
Wene-Riya-Iszem = Mother- in- Law
Nwọ-Rụka-Nwọm = Sister- in- Law
Nwọ-mati = Grand Son
Enyi = Granddaughter
Enyi-riya = Child
Enyi-rụka = Friend
Nye-ọrọ-badụ = Girlfriend
Irọ = Boyfriend
Rụka = Neighbor
Riya = Enemy
Badụ = Person
Wenem-rụka = A male child of the same parents With you is your brother
Wenem-riya = Female child of the same parents Is your sister
Wene-Riya-Nnem = A sister to your father or mother is Your aunty
Adanne = Mother's first daughter is named After her name
Adanda = Father's first daughter is named After his name
wene-rụka-ndam = Brother to your father or mother is your Uncle
Nwọ-rụka-nụ-wenem = A son to either to your brother or to your sister is your nephew
Rụmụ-wenem = Children of your parents are your Siblings
Nwere-Ndam = The wife of your father but not Your mother is your step mother
# Body parts
Rikirize = Hair
Risi = Head
In-see = Ear
Anya = Eye
Imi = Nose
Ony = Mouth
Ili = Neck
Obo-Aka = Shoulder
Rama = Breast
Ọvu = Chest
Mkpere-Aka = Elbow
Ruwo = Stomach
Ikuwnu = Waist
Mkpekwnu = Navel
Aka = Arm
Ra-da-Aka = Hand
Mkpa-Aka = Fingers
Mpata-Or-chi = Tigh
Mkpere-Or-chi = Knee
Or-chi = Leg
Mkpa-Or-chi = Toe
Ra-da-Or-chi = Foot
Risi-Or-chi = Heel
# Asking questions
Kini = What?
Kini-bụ-ra-ha-ye = What is your name?
Kini-mega = What is happening?
Ka-bụ-ọla = What is this?
Kini-ihe-chọrụ = What do you want?
Nda-ọbụ = Which?
Nda-ke ichọrụ = Which one do you want?
Nda-ke bụrụ-ọma = Which one is good?
Nda-wụri ke-masi-gai = Which food do you Like most?
Nda Riyaa ke masi-gai = Which girl do you like most?
Nda-iwo-ke-masi-gai = Which cloth do you Like most?
ibụ-ye-le = Who?
Yelee-sụkụ-gam = Who is calling me?
Nda-ye-chọrụ-ọla = Who want to go?
Pa-lee = Where?
Nda-pe-ize = Where are you going?
Nda-pe-gwerụ-iwo-kam = Did you Collect cloth?
Nda-pe-iwụ = Where do you lives?
Nda-pe-Ezi = Where are you?
Nda-pe-ebi-tara-ya = Where did you put it?
Nda-pe-ihụrụ-ya = Where did you see it
ihụrụ-eze nụ pelee = Where did you see the chief
Nụ-ọla = How?
Nda-su-ka-merụ = How did it happen?
Nda-ega-dụ-pee = How did you get There?
ọdụrụ-ọla = How much?
ọzi-ọla = How much is it?
ọbụ-iwayi-lee-izụ-rụ-ka = How much did you Buy it?
iji-iwayi-lee = How much do you Have?
ọbụ-lee-zi = How many?
ọbụ-Rụmụ-ọ-lee-iwerụ = How many children have you?
ọbụ-nwere-lee-nda-ye-Weru = How many wives does Your father has?
iwayi-lee-ka-bụ = How do you sell it
Eme-lee = Can
izim-eme-lee = Can you do it?
izim ọpi-oli-Nwọ-mati = Can you find the Child?
Nbụrụ elee = When?
Ka-num-bụ-rụ-la-zi = When are you going?
Nkam-bụ-rụ-biarụ = When did you come?
Sụ-ka-merụ = Why?
Sụ-ka-merụ-ibiala-nụ-ọge = Why are you late?
Nyelee = Whose?
Nyelee-nwe-ọkwụ-kwụ-Kam = Whose Book is this?
Nyelee-Nwe-Nwọ-kam = Whose child is this?
Nyelee-Nwe-kam = Whose is this?
ibiala = Have you come?
inwe-pe-ewhụ = Have you got Accommodation?
ihụ-na-Eze = Have you see the Chief?
# More questions
Ozi-pe-lee = Where is it?
iwai-lee-bụ aramadụ-kam = How much is this Orange?
Nda-kpa-ihe-merụ = How are things?
Mgbe-ka-kini = What is the time?
Kam-bụ-yelee = Who is that?
Kini-bụ-ra-ha-ye = What is your name?
Nbụrụ-lee-iji-a-bia = When should I expect you?
Ndah-ke-ọbụ-igwerụ = Which one do you choose?
Bi-kọ,gọrisim-Apa = Please, can you show me the way?
# Everyday expressions
Chiọkike/Chineke = The Almighty God, the Creator of heaven and earth
Rụmụwenem anụ meka = Brother/sister
iwhuruụoha badụ = The people of Iwhuruụoha Ikwerre Asa
Eli-iwhuruụoha = The land of Iwhuruụoha or the blessed earth of Iwhuruụoha
Bi-kọ/Gbarụ = A beg
Ka-bụ-nwọ-iwhuruụoha = A noted person that came from Ikwerre
Gbarụ-sụ-wene m = Have mercy please, my brother or sister please forgive
Nji-gam-onụ-iwhuruụoha-ọ-k w ụ-ọka = I am speaking my Ikwerre dialect
iwhuruụoha-bụ-nde Nma = Ikwerre persons are good people.
Eli-iwhuruụoha-leh! = Long expressions
Ka-si-nkpọrma bi-kọ = Take heart abeg. Bear with me please
ikwerre mụrụm = The land of my birth Ikwerre my father land
Sọ-rum-ke-la Chiọkike/Chineke ta-bụ-ọbọchi-bụ-rụ-oma = Join me to thank God, today is a good day for me.
Nye-bisi-bụ oma-nụ-eli iwhuru = Evil person is not good in our land
ọchi-Aliiri = The defender of his people
Nde-wenem-nụ-rụka-nuriya an ụ meka-oh = My brothers and sisters I thank you all.
Anụ-kanụ chiọkike yamelem = Please join me to tell God. Thank you.
ikwerre meka-ọ, Eli iwhuruụoha meka-ọ,ikwerre-bụ-ọtụ-meka ọ = All means normal general greetings
ibiala = Welcome. Used to welcome strangers to new fold or home.
ibụ-badụ = Right person. Worthy person. Bossom friend.
Badụ-dieli = A person who believes in tradition of the land. Or of his people
Nm-Kalam gi meka wee = Saluting someone of the same mate.
Ka-bụ weri-eli iwhuruụoha = Traditional food prepared for and eaten by Ikwerre people.
Wene = Relations or relatives
Nwọ-Marụnma = Used to describe fine man, or beautiful lady of good characters.
Chiọkike menieya = Usually means. God has done it
Chaii,ka-bụ-rụkwa-ọma = This is correct sound-beat
Ikwerre-bụ-ọtụ = We are one body
Rụ-kwa = Sound instrument made from animals skin coupled with carved wood.
Rukwa-ọma-sụ-ikwerre-mụrụm = The sound of the drum is good
ọbọchi = Means date or day. Example: today is third market day in the week.
Sụ-ga-nụ-ọnụ = Very sweet in the mouth. It is tasty.
A-ta-ba-la-mini-ọhia-Azụ = Tilapia fish from fresh water.
Ọbọ-Aka = The thumb harp
Leru-anya-sụ-nne = Goodbye mother
Anụ-hụ-ya-ma-ze-ahia = Calling others to come let us go to the market
Din-kpa-esawụ = Man of greatness
iji-akpụ = Local chips made out of cassava called Tapioca are good.
Aziri-nụ-ọtụ = Means let us be one
ogbulem-ọkwụ = I miss you
i-menem = You have done well.
Mbrah = Now
Awa-wee = Surprise
Mgba-la = Twins
Kpa-kara = All
Ka-gida = Big
Mati = Small
Rụhwụ = Front
Azụ = Back
ọlụ = Up
Dah = Down
ogologo = Long
Bia = Come
ọkpọ-Nka = Carpenter
Aba-li = Night
ize-ba-la = Are you going
Se-ru = Wait
Tufi-akwa = Forbidden.
Ri-cha = White
Rigi = Black
ihwe = Light
Mgbe-da-chi = Darkness
Ehi-hee = Noon
Se-tee = Forget
Ekele = Glory be to Almighty God
Gbaya-gbaya = Rush
# Idioms
oka-we-nem-risi = Feel confident.
Badụ-rụhwụ-la-bụ-ọma = Applying caution in dealing with a man of double character
Nye--kwụ-ozi-kwụ = A liar
Badụ-mgbọ-chi = A person who prevents others from having what he himself has no use of
Wene-ọtụ-ọrọ = Nearest of blood Relation
Badụ-ma-ha = A worthless person
oka-zi-la-nụ-weri-Akwwụ = To resume work after a holiday
Suma-Anya-mini = Take care
oka-bụ-ọma = Avoid trouble
oka-hwọ-lam-wee = To reveal a secret
Nye-nụ-ọtụọtọri-tụ-kwụ-kọ-oma = Face reality and Bear the consequence
Nye-zi ọka-mati-ba nam-ke-kwụ = To come out of small problem into bigger one
Badụ Nwụ-nam-nụ-ọkaka = To die
Kini-bụ-ọka = A cause of dispute
Badụ-rụhwụ-ọma = To emerge victoriously
Badụ-nụ-mekpa-ihe-ọwa = Get into difficulties
Nye-Agwa-bụ-ọma = To act foolishly
Hụ-ọma-me-lem = Success
Ha-we-lem-risi = Certainly
ọme-rụ-me-gwa-rụ = To return evil for evil
De-si-nụ-ọkwụ-kwọ-kam = Write it in paper with ink
Nye-zi-me-kwa-kọ-ma = Becomes conscious after fainting, to realize one's mistake
Gwe-rụ-owa-ihụrụ-ya = Take a difficult problem courageously
Mgbaesor = To run away
Ha-ka-zi-mkpa-kọ-ma = The most important
# Everyday things
Ọbiri-Eze = Palace
Ọrọ = Home
Ọke-ọshimini = Sea
Oshimini = Rivers
Igbogọ = Forest
Ahia = Market
Ọrọ-Agbara = Juju-house
Ekwụ = Farm
Ọrọ-ọkwkwọ = School
Ọrọ-chiọkike = Church
Ogbọrọma = Road
Sụ-ọla = Way
Ọrọ-iwayi = Bank
ọkọ-ohia = Jungle
Ọkwụkwọ = Book
Ọkwụkwọ-nsọr = Bible
Ọkpụ = Cap
Ikpakọ-ọrchi = Shoe
Ncha = Soap
Iwo = Cloths
Apa-ogbọr-eli = Rail way
Apa/Epa = Street
Ogbọr-ọlụ = Air plane
Eli-gbeke = White man land
Sapọ = Sponge
Ara = Salt
Maya-Ngụọ = Palm-wine
Ọkpọrọkọ = Stock fish
Iwayi = Money
Nye-gbeke = White man
Eji = Kola-nut
Ekika = Biscuit
Asa = Hoe
Ọlu-igwe = Sky
Sisi-Ngwọ = Palm tree
Ọyọr-gbeke = Mirror
Nkagi = Spoon (small)
Eku-bee = Big spoon
Ọrọ-okai = Thatch house
Ite-wụri = Cooking pot
Ọrọ-wụri = Kitchen
Ikpe-chi = Chair
Ngada = Table
Sisi-bụdụ = Live stick
Alanga = Needle
Ọlọlọ/Nkara-ma = Bottle
Echecha = Bread
Ọsikiri = Sugar
Mini-rama = Milk
Mini-ọlụ = Rain
Aham/Eham = Sun
Ọkpata = Bed
Etere = House matt
Ogbashi = Loan
Bi-lem = End
Mọnọ = Oil
Nkụme = Stone
Rụigwe = Iron
Igọdọ = Key
Eriri = Rope
Ra-tụ = Ash
Nkpọr = Nail
Ikpeh = Wrapper
Rizah = Sand
Eli/Ali = Earth
Okoko mini/Iko mini = Cup
# Animals
Nkita = Dog
Nkolọma = Cat
Ọke-ezhi = Pig (male)
Nwere-ezhi = Pig (female)
Nwere-wọwụ = Goat (female)
Nwọ-pi = Goat (male)
Atụrụ = Sheep
Evụlụ = Ram
Eehi = Cow
Nwere ọchi-chi = Hen
Ọchi-chi gbeke. Ọchi-chi mini = Duck fowl
Eyi = Rabbit
Agụ = Tiger
Ọdụm = Lion
Mbekụ = Tortoise
Agwọ = Snake
Wọlọ = Antelope
Enwe = Monkey
Ezọ = Chimpanzee
Agwọ Chimini = Cobra
Ekere-kụ = Rat
Ọ-kpọ-eli = Viper
Mbekụ-Mini = Turtle
Ọpọrọ = Shrimp
Riyọrọ = Cray fish
Etitara = Periwinkle
Ekwa = Bush fowl
Nchi = Grass cutter
Nkapi = Shrew
Ikwikwii = Owl
Egbe = Hawk
Idele = Vulture
ọchọkọrọ = Crab
Igọ = Eagle
Nbiri = Lizard
Rụgbam = Cat-fish
Aba-mini = Crocodile
Ọke-ọchi-chi = Cock
Agụ-mini = Hippopotamus
Awọ-mini = Frog
Egi-ohia = Snail
Edụ-Abali = Black Leopard
Alika = Redneck Lizard
Nye-nya = Horse
Ihụ = Fox
Nkita-ohia = Wolf
Asaa = Squirrel
Ebi-ohia = Porcupine
Ọsụw = Bat
Enni = Elephant
# Insects
Ruzọr = Housefly
Ntụ-ta = Mosquito
Akpi = Scorpion
Ọsụ = Millipede
Mgbasini = Ant
Asisa-nsa = Cockroach
Akika = Termite
Erembara = Butterfly
Ebe = Beetle
Ewhewhe = Honey bee
Evụụ = Bee
Akpara = Grasshopper
Erụ-rụ = Maggot (big)
Rukpụrụ-Kpurụ = Maggot (Small)
Ọkpọhụ = Tsetse fly
Ọmụ-mụ-wa = Star fly
Chi-nchi = Bedbug
Ọkpọrọkpọrọ-ruzọr = Greenfly
Mgbere-tọlọ = Worm
Ruzọr-mini = Dragonfly
Akpara-okpọr = Mantis
# Fruits and vegetables
Ali-baza/Ayọ = Onion
Afụfara/Esara = Garden egg
Esewiri = Pepper
Aramandụ = Orange
Nnere = Banana
Ọkwụrụ = Okro
ise-rụ-gi = Green pepper
Ibeh = Pear
Igiri/ijiri = Mango
ikpa = Corn
Maya-mgbukọ = Sugar cane
Akwaba = Pine-apple
Isee-eli = Ginger
Ọda = Apple
Aki-ni-ma = Plantain
Eli-gbọr = Better leaf
Ọkwụ-kwọ-wụri = Green leaf
Akụ-gbeke = Coconut
Ekpe-gbeke = Avocado pear
Ise-eji = Alligator pepper
Ọkụrụ-gbeke = Paw-paw
Akidi /Agwa = Beans
Akidi-ọkpọ = Native Beans
Ngbọgụrụ = Ponkin
Arụsi = Rice
Erọ = Mushroom
Mgbedengi = Scent leaf
Ayi-ya = Apricot/monkey kola
Mkpurụ = Seed
Asaran Weri = Tomato
# Ikwerre culture words
ERI = Cultural dance usually carried out in various Ikwerre tribes.
ERI ERIJI = Annual yam festival carried out in various Ikwerre tribes.
ỌBA-IJI = Means yam barn usually found in the individual backyard
ỌRỌ = This means family
ỌCHI-ỌHA = Means the head leader of the public or citizen of Ikwerre tribes.
NYE-CHI-ELI = This means a ruler of the land. This means the head of land.
NYE-WE-ELI = Means the owner of the Land (Paramount ruler)
EZE = Means king a supreme title holder in Ikwerre land.
DI-ELI = This means a true son or daughter of a village or community
NYENWE-ỌRỌ = Means the person in charge of the house or family head.
NKPỌR-ỌGỤ = Means a place of settlement after or in the cause of reprisal attacks.
ERI-ỌBỌ = This means a dance played with local made Guitar
SIKWA-NWIRI = Means asking hands in marriage
ỌJỤUKWỤ = Means in Ikwerre dialect my big friend
AMADI = Free born or first son.
ỌSỤJI-ELI = Means to pour libation as to appease the land
ỌWHỌR = Means Symbol of Authority of leadership or gavel used by owhor holder.
MANYA = Means wine or hot drinks locally produced for consumption.
GBAESỌR = Means running away or directing someone to come with run.
ỌRYI = Means my friend, could be a man or woman.
ALERỤ = Means looking upon something or expecting something.
IKWỤ = Means calling
MINI = Water
WENE = Means relations
MEKA = Simple means greetings
ỌVỤ-NKPỌMA = Means mind
BI-KỌ = Simple means a beg, plea, or to do something one requested of it.
ERIRI = Means rope
ALEKIRI = Means times
ỌCHI-CHI = Means leadership
NDAM = Means my Father
iYILA = Means welcome
GWERỤ = Means take
AGBARA = Means spirit
LAA = Means go
AKPA = This means bag
AKPATI-EGBE-IZỤ = Means coffin
RIAGBỌ,ASARAGBỌ, EBERI, MMAKARA AND NNIM = Means the five market days in a week
NYE-DIKE = Means mister. A courtesy title of a man or a boy in Ikwerre dialect.
NMA = Means beauty
MATI = Means little things
NYE ISI AGBARA = Means the holder to the affairs of the deity.
RỤMỤ-ỌKỌRỌBIA = Means the Youths in the community
ỌBỌCHI = Means days.
EKIRI-GBEKE = Handset or Telephone
ỌDOGARA/MBARAKA = Means Cassava usually planted and harvested after 9 or 12 months
NJỌ = Means ugly, things describe of evil or forbidden in the community.
MKPURU-OBOCHI = Means dates
KPE-TEM = Means end of discussion;
# Counting 1 to 20
Ọtụ = 1
ebụọ = 2
etọ = 3
enọ = 4
ise = 5
isụnụ = 6
asawụ = 7
asatọ = 8
itolụ = 9
iri = 10
iri-nụ-ọtụ = 11
iri-nụ-ebụọ = 12
iri-nụ-etọ = 13
iri-nụ-enọ = 14
iri-nụ-ise = 15
iri-nụ-isụnụ = 16
iri-nụ-asawụ = 17
iri-nụ-asatọ = 18
iri-nụ-itolụ = 19
Ọgụ = 20
# Counting 21 to 40
Ọgụ-nụ-ọtụ = 21
Ọgụ-nụ-ebụọ = 22
Ọgụ-nụ-etọ = 23
Ọgụ-nụ-enọ = 24
Ọgụ-nụ-ise = 25
Ọgụ-nụ-isụnụ = 26
Ọgụ-nụ-asawụ = 27
Ọgụ-nụ-asatọ = 28
Ọgụ-nụ-etọlu = 29
Ọgụ-nụ-iri = 30
Ọgụ-nụ-iri-nụ-ọtụ = 31
Ọgụ-nụ-iri-nụ-ebụọ = 32
Ọgụ-nụ-iri-nụ-etọ = 33
Ọgụ-nụ-iri-nụ-enọ = 34
Ọgụ-nụ-iri-nụ-ise = 35
Ọgụ-nụ-iri nụ-isụnụ = 36
Ọgụ-nụ-iri-i-asawụ = 37
Ọgụ-nụ-iri-i-asatọ = 38
Ọgụ-nụ-iri-itolụ = 39
Ọgụ-laa = 40
# Counting 41 to 60
Ọgụ-larụ-nụ-ọtụ = 41
Ọgụ-larụ-nụ-ebụọ = 42
Ọgụ-larụ-nụ-etọ = 43
Ọgụ-laa-nụ-enọ = 44
Ọgụ-laa-nụ-ise = 45
Ọgụ-laa-nụ-isụnụ = 46
Ọgụ-laa-nụ-asawu = 47
Ọgụ-laa-nụ-asatọ = 48
Ọgụ-laa-nụ-itolụ = 49
Ọgụ laa/lawurụ-nụ-iri = 50
Ọgụ laa/lawurụ nụ-ọtụ = 51
Ọgụ laa/lawurụ-nụ-iri-nụ-ebụọ = 52
Ọgụ laa/lawurụ nụ-iri-nụ-etọ = 53
Ọgụ-(lawuru) laa nụ-iri-nụ-enọ = 54
Ọgụ laa/lawurụ-nụ-iri-nụ-ise = 55
Ọgụ laa/lawurụ-nụ-iri-nụ-isụno = 56
Ọgụ laa/lawurụ-nụ-iri-esawụ = 57
Ọgụ laa/lawurụ nụiri-nụ-asatọ = 58
Ọgụ laa/lawurụ-nụ-iri-nụ-itolụ = 59
Ọgụ-etọ = 60
# Counting 61 to 80
Ọgụ-etọ-nụ-ọtụ = 61
Ọgụ-etọ-nụ-ebụọ = 62
Ọgụ-etọ-laa-nụ-etọ = 63
Ọgụ-etọ-nụ-enọ = 64
Ọgụ-etọ-nụ-ise = 65
Ọgụ-etọ-nụ-isụnụ = 66
Ọgụ-etọ-nụ-asawụ = 67
Ọgụ-etọ-nụ-asatọ = 68
Ọgụ-etọ-nụ-itolụ = 69
Ọgụ-etọ-nụ-iri = 70
Ọgụ-etọ-nụ-iri-nụ-ọtụ = 71
Ọgụ-etọ-nụ-iri-nụ-ebụọ = 72
Ọgụ-etọ-nụ-iri-nụ-etọ = 73
Ọgụ-etọ-nụ-iri-nụ-enọ = 74
Ọgụ-etọ-nụ-iri-nụ-ise = 75
Ọgụ-etọ-nụ-iri-nụ-isụnụ = 76
Ọgụ-etọ-nụ-iri-nụ-asawọ = 77
Ọgụ-etọ-nụ-iri-nụ-asatọ = 78
Ọgụ-etọ-nụ-iri-nụ-itolụ = 79
Ọgụ-enọ = 80
# Counting 81 to 100
Ọgụ-enọ-nụ-ọtụ = 81
Ọgụ-enọ-nụ-ebụọ = 82
Ọgụ-enọ-nụ-etọ = 83
Ọgụ-enọ-nụ-enọ = 84
Ọgụ-enọ-nụ-ise = 85
Ọgụ-enọ-nụ-asunụ = 86
Ọgụ-enọ-nụ-asawo = 87
Ọgụ-enọ-nụ-asatọ = 88
Ọgụ-enọ-nụ-itolụ = 89
Ọgụ-enọ-nụ-iri = 90
Ọgụ-enọ-nụ-iri-nụ-ọtụ = 91
Ọgụ-enọ-nụ-iri-nụ-ebụọ = 92
Ọgụ-enọ-nụ-iri-nụ-etọ = 93
Ọgụ-enọ-nụ-iri-nụ-enọ = 94
Ọgụ-enọ-nụ-iri-nụ-ise = 95
Ọgụ-enọ-nụ-iri nụ-asụnụ = 96
Ọgụ-enọ-nụ-iri-nụ-asawọ = 97
Ọgụ-enọ-nụ-iri-nụ-asatọ = 98
Ọgụ-enọ-nụ-iri-nụ-itolụ = 99
Ọgụ-ise = 100
# Counting 101 to 120
Ọgụ-ise-nụ-ọtụ = 101
Ọgụ-ise-nụ-ebụọ = 102
Ọgụ-ise-nụ-etọ = 103
Ọgụ-ise-nụ-enọ = 104
Ọgụ-ise-nụ-ise = 105
Ọgụ-ise-nụ-isụnụ = 106
Ọgụ-ise-nụ-asawọ = 107
Ọgụ-ise-nụ-asatọ = 108
Ọgụ-ise-nụ-itolụ = 109
Ọgụ-ise-nụ-iri = 110
Ọgụ-ise-nụ-iri-nụ-ọtụ = 111
Ọgụ-ise-nụ-iri nu ebụọ = 112
Ọgụ-ise-nụ-iri-nụ-etuo = 113
Ọgụ-ise-nụ-iri-nụ-enọ = 114
Ọgụ-ise-nụ-iri-nụ-ise = 115
Ọgụ-ise-nụ-iri-nụ-isụnụ = 116
Ọgụ-ise-nụ-iri-nụ-asawọ = 117
Ọgụ-ise-nụ-iri-nụ-asatọ = 118
Ọgụ-ise-nụ-iri-nụ-itolụ = 119
Ọgụ-isunụ = 120
# Counting 121 to 140
Ọgụ-isunụ ọtụ = 121
Ọgụ-isunụ-ebụọ = 122
Ọgụ-isunụ-etọ = 123
Ọgụ-isunụ enọ = 124
Ọgụ-isunụ = 125
Ọgụ-isunụ nu = 126
Ọgụ-isunụ-asawọ = 127
Ọgụ-isunụ-asatọ = 128
Ọgụ-isunụ-itolụ = 129
Ọgụ-isunụ-iri = 130
Ọgụ-isunụ-nụ-iri-nụ-ọtụ = 131
Ọgụ-isunụ-nụ-iri-nụ-ebụọ = 132
Ọgụ-isunụ-nụ-iri-nụ-etọ = 133
Ọgụ-isunụ nụ-iri-nụ enọ = 134
Ọgụ-isunụ--nụ iri-nụ-ise = 135
Ọgụ-isunụ-nụ-iri-nụ-isụnụ = 136
Ọgụ-isunụ-nụ-iri-nụ-asawọ = 137
Ọgụ-isunụ-nụ-iri-nụ-asatọ = 138
Ọgụ-isunụ-nụ-iri-nụ-itolụ = 139
Ọgụ-asawo = 140
# Counting 141 to 160
Ọgụ asawo nu ọtụ = 141
Ọgụ-asawo nu-ebụọ = 142
Ọgụ-asawo nu etọ = 143
Ọgụ-asawo nu enọ = 144
Ọgụ-asawo nu-nụ-ise = 145
Ọgụ-asawo nu isụnụ = 146
Ọgụ-asawo nu asawọ = 147
Ọgụ-asawo nu asatọ = 148
Ọgụ-asawo nu itolụ = 149
Ọgụ-asawo nu-iri = 150
Ọgụ-asawo nụ-iri-nụ-ọtụ = 151
Ọgụ-asawo nu iri nu ebuo = 152
Ọgụ-asawo nu-nụ-iri-nụ-etọ = 153
Ọgụ-asawo nu iri-nụ-enọ = 154
Ọgụ-asawo nu iri-nụ-ise = 155
Ọgụ-asawo nu-iri-nụ-isụnụ = 156
Ọgụ-asawo nu iri-nụ-asawo = 157
Ọgụ-asawo nu iri-nụ-asatọ = 158
Ọgụ-asawo nu nụ-iri-nụ-itolụ = 159
Ọgụ-asato = 160
# Counting 161 to 180
Ọgụ-asato nu-ọtụ = 161
Ọgụ-asato nu-ebụọ = 162
Ọgụ-asato nu-etọ = 163
Ọgụ-asato nu-enọ = 164
Ọgụ-asato nu-ise = 165
Ọgụ-asato nu-isụnụ = 166
Ọgụ-asato nu-asawo = 167
Ọgụ-asato nu-asatọ = 168
Ọgụ-asato nu-itolụ = 169
Ọgụ-asato nu--iri = 170
Ọgụ-asato nu iri nu otu = 171
Ọgụ-asato nu-iri-nụ-ebụọ = 172
Ọgụ-asato nu--iri-nụ-etọ = 173
Ọgụ-asato nu-iri-nụ-enọ = 174
Ọgụ-asato-nu-iri-nụ-ise = 175
Ọgụ-asato-nu iri-nụ-isụnụ = 176
Ọgụ-asato nu-iri-nụ-asawọ = 177
Ọgụ-asato nu-iri-nụ-asatọ = 178
Ọgụ-asato nu-iri-nụ-itolụ = 179
Ọgụ-itolu = 180
# Counting 181 to 200
Ọgụ-itolu nu ọtụ = 181
Ọgụ-itolu-nụ-ebụọ = 182
Ọgụ-itolu nụ-etọ = 183
Ọgụ-itolu nu-enọ = 184
Ọgụ-itolu nụ-ise = 185
Ọgụ-itolu nụ-isụnụ = 186
Ọgụ-itolu-nụ-asawọ = 187
Ọgụ-itolu nụ-asatọ = 188
Ọgụ-itolu nụ-itolụ = 189
Ọgụ-itolu nụ iri = 190
Ọgụ-itolu nụ iri-nụ-ọtụ = 191
Ọgụ-itolu nụ iri-nụ-ebụọ = 192
Ọgụ-itolu-nụ iri-nụ-etụ = 193
Ọgụ-itolu nụ iri-nụ-enọ = 194
Ọgụ-itolu nụ iri-nụ-ise = 195
Ọgụ-itolu nụ iri-nụ-isụnụ = 196
Ọgụ-itolu nụ iri-nụ-asawọ = 197
Ọgụ-itolu-nụ-iri-nụ-asatọ = 198
Ọgụ-itolu-nụ iri-nụ-itolụ = 199
Ọgụ-iri = 200`;
const EX={"proverbs": [{"id": "prv-1", "ikwerre": "Otu rigbineh akah nferuleh monor, odumuleh eleh chiari.", "english": "When one finger touches oil, it spreads to all the others.", "meaning": "The actions of an individual reflect upon and affect the entire family or community.", "theme": "Community & Unity"}, {"id": "prv-2", "ikwerre": "Nsni ngeshie ezih tornushi rishi mah wogbu whuormelaa.", "english": "The ears that do not listen to advice follow the head when it is cut off.", "meaning": "Refusal to heed wise counsel and warnings leads to inevitable destruction.", "theme": "Wisdom & Caution"}, {"id": "prv-3", "ikwerre": "Nheh eni laburu nluru orgwu, ruhiara yah nheh nweh awhnuwhnu.", "english": "Where two elephants fight, the grass is the one that suffers.", "meaning": "When powerful leaders or factions conflict, innocent commoners bear the hardship.", "theme": "Peace & Justice"}, {"id": "prv-4", "ikwerre": "Akah orna nkwor akah ikpu, akah ikpu kwor akah orma.", "english": "If the right hand washes the left hand, the left hand washes the right hand.", "meaning": "Mutual support and cooperation are the keys to prosperity and cleanliness.", "theme": "Cooperation"}, {"id": "prv-5", "ikwerre": "Garu nu omumeh, yah kpar enweh jiri muhia oyih oluh.", "english": "By constant doing (practice), that is how the monkey learned to climb.", "meaning": "Mastery comes only through dedication, patience, and repetitive effort.", "theme": "Learning & Persistence"}, {"id": "prv-6", "ikwerre": "Okornuche nuleh ikwnu ezi ushishi, otu badnu ungwugburu-shilea.", "english": "Wisdom is like the trunk of a giant tree; one person alone cannot embrace it.", "meaning": "No single individual possesses all knowledge; we must learn from one another.", "theme": "Humility & Knowledge"}, {"id": "prv-7", "ikwerre": "Nwo nma nmah ndah lurua.", "english": "A person who asks questions never gets lost.", "meaning": "Seeking guidance and asking with humility will always show you the right way.", "theme": "Inquiry & Respect"}, {"id": "prv-8", "ikwerre": "Nsirimobi seh eshili okwute, oyah enwere owor orsukwu.", "english": "Patience can cook a stone to tenderness.", "meaning": "Enduring patience and resilience will overcome seemingly insurmountable hardships.", "theme": "Patience"}, {"id": "prv-9", "ikwerre": "Tehlem rumu onuohia wehia onuohia nseh otu nu beh, otumu gbakah seh amanu diohia nma.", "english": "Until the animals get their own historian, histories will always favor the hunter.", "meaning": "Those who do not tell their own story will have it written by others to their disadvantage.", "theme": "Identity & History"}, {"id": "prv-10", "ikwerre": "Otuh ushishi gbashie igbogo.", "english": "A single tree does not make a forest.", "meaning": "True strength lies in community, collective action, and kinship.", "theme": "Community"}], "stories": [{"id": "story-1", "titleIkwerre": "Enyimebi (Nne Anumu nu Ebi)", "titleEnglish": "My Friend the Grasscutter and the Mother Hen", "category": "Moonlight Tale (Otnutnu Nu Ruwhere Onwa)", "summary": "A moving parable from the elders of Emohua about grief, endurance, and shared suffering. When the grasscutter loses her only child, the mother hen consoles her with the sorrowful song of her thirteen lost chicks.", "moralLesson": "You will never understand the depth of another's pain until you have walked through sorrow; courage and consolation must be drawn from shared life experiences.", "paragraphs": [{"speaker": "Narrator", "ikwerre": "Nne Anumu muru rumu nrih nu etor (13 chicks) korbu kpara kpara ha larnuru nu enwu. Enyim ebi nweru sorsor nwo otu, ma odaru enwu.", "english": "Mother Hen hatched thirteen chicks, but one by one each was lost to nature and predators. Her friend, the grasscutter, had only one baby and also lost it."}, {"speaker": "Ebi (Grasscutter)", "ikwerre": "Enyim Anumu, ibaleh? Wiri kweh neh ewhueh nu onum... nwo m lelah.", "english": "My friend the Hen, have you come? Food has refused to pass down my throat... my only child is gone."}, {"speaker": "Anumu (Mother Hen)", "ikwerre": "Enyim, biko ri wiri mah idnu! Geteh nshi mah inuruh abu m: \"Nrih nu rumu etor - Okwor gweru otu! Agwor gweru ooh! Eleh bu badnu gweru! Egbe gweru!\"", "english": "My friend, please eat so that you will live! Listen to my lament: \"Thirteen chicks was my brood - The hawk took one! The snake took one! Humans took one! The kite took another!\"", "question": {"prompt": "Why did Mother Hen sing her song of thirteen lost chicks to the Grasscutter?", "options": ["To show that she too knew immense grief, yet chose to endure and live", "To boast that hens have more children than grasscutters", "To ask the grasscutter to lend her food"], "correctIndex": 0, "explanation": "Mother Hen shared her own deep losses to console her grieving friend and urge her not to give up on life."}}, {"speaker": "Narrator", "ikwerre": "Ngeh Ebi nuru abu yarm, omataru nu enwvu nwo nneh berere gbushie nu enhi tehlem ogbukwushi nu kei. Ha biamiri anya biri nu udoh.", "english": "When the Grasscutter heard her friend's sorrowful song, she felt deeply consoled and realized she was not alone in grief. They dried their tears and ate together in peace."}]}, {"id": "story-2", "titleIkwerre": "Anyim Darnu nu Oluigwe", "titleEnglish": "The Tortoise Falls from the Sky", "category": "Moonlight Fable", "summary": "The classic tale explaining how the clever squirrel Essarh hid his mother in heaven during famine, how the cunning tortoise Anyim deceived the animals, and why the tortoise shell is cracked to this day.", "moralLesson": "Greed and treachery recoil upon the doer; do not repay deception with greater malice, for truth and nature always exact their balance.", "paragraphs": [{"speaker": "Narrator", "ikwerre": "Ngeh agwnu wiri gbalah nu eli onuohia, Essarh (squirrel) zotaru nne ya nu oluigwe. Osenyehe bukwu gwa nne ya: \"Nnam chidah udor, nwoi bagwuo!\"", "english": "During a great famine in the animal kingdom, Essarh the palm squirrel hid his mother in heaven. Daily he climbed the tall palm tree and sang: \"Mother drop the rope, your son is coming!\""}, {"speaker": "Anyim (Tortoise)", "ikwerre": "Essarh nejih bukwu, ndah kpar ojigwu neh emei ivu? Gwam eziokwu!", "english": "Squirrel the palm fruit eater, how is it that you grow so fat while all others starve? Tell me the truth!"}, {"speaker": "Narrator", "ikwerre": "Anyim wukwusiri akpati ntukpor ash, chia uwhueh rimeh akpa Essarh. Anyim hu orikwuro oluigwe, kporo anuohia nileh ma ha gbuo nne Essarh!", "english": "Tortoise secretly filled squirrel's pouch with ash through a tiny hole and traced his path. He discovered the secret and gathered all animals to invade heaven!"}, {"speaker": "Essarh (Squirrel)", "ikwerre": "Nnam chabimeh udor! Obiyah nwoi bagwuo! (Mother cut the rope! It is not your son!)", "english": "Mother cut the rope! It is not your son coming!", "question": {"prompt": "What happened when the squirrel warned his mother in heaven?", "options": ["She cut the rope, causing Tortoise and the invaders to crash to earth", "She dropped golden yams for all the animals", "She invited Tortoise to become king of heaven"], "correctIndex": 0, "explanation": "The mother severed the rope, sending the trespassers crashing down—shattering Tortoise's shell into the puzzle-like plates seen today."}}, {"speaker": "Narrator", "ikwerre": "Udor gbereh chabimeh, Anyim dahnuru eli kpokwawamah! Ejih (snail) bialeh dokashia akpukpor Anyim. Yah kpar Anyim jiri nweru nkwakwah nu azua.", "english": "The rope was severed and Tortoise shattered upon the earth. The snail carefully patched his shell back together, which is why the tortoise has patched plates on his back till this day."}]}, {"id": "story-3", "titleIkwerre": "Khom nu Wayanwu", "titleEnglish": "The Coup in the Animal Kingdom", "category": "Animal Lore", "summary": "How Wayanwu, the strongest beast in the forest, was betrayed by his brother the wild cat Khom who allied with the lion Orgunu for a promised feast—only to be left with scraps and eternal regret.", "moralLesson": "Betraying your kin for empty promises will bring regret; the deceiver is always consumed by those stronger than himself.", "paragraphs": [{"speaker": "Narrator", "ikwerre": "Wayanwu bu anu karia ikeh nu eli rumu onuohia nileh. Orgunu (lion) tukporo Khom ohia (cat) kwuru ya: nyem aka igbu nwanne i, ma m kenye gi erimeri karia.", "english": "Wayanwu was the fiercest cat, feared even by the lion. The lion approached the gluttonous cat Khom, promising a mountain of meat if he betrayed his brother."}, {"speaker": "Khom (The Cat)", "ikwerre": "Wayanwu wannam, gweru eriri akpi keshia ehni gi mah anuohia hu ikeh gi!", "english": "Wayanwu my brother, let the gorilla bind you with the scorpion knot to prove none can hold you!", "question": {"prompt": "What traditional Ikwerre knot is referenced in this fable?", "options": ["Idneh Enwch (The Monkey knot of Emohua)", "The Fisherman's hitch", "The Cowrie binding"], "correctIndex": 0, "explanation": "The legend specifically highlights \"Idneh Enwch\" (the monkey knot), a famous traditional rope-tying technique still known in Emohua."}}, {"speaker": "Narrator", "ikwerre": "Ngeh ha keshiri Wayanwu, anuohia nileh gburu ya. Khom natara nwantakiri okpar. Kemgbe ahia, pussycat neh ebere \"Wayanwu, Wayanwu\" nu ochichi.", "english": "Once bound, the animals killed Wayanwu. The lion broke his promise and gave the cat only tiny scraps. To this day, the solitary cat weeps \"Wayanwu, wayanwu\" in remembrance."}]}], "history": [{"id": "ch-1", "chapterNumber": 1, "title": "The Origin & The House of Obio", "period": "Early 13th Century AD", "summary": "The genealogical roots of Rebisi, tracing back to Obio of Ikwerre origin, the tragic feud between brothers Apara and Evo, and the founding of Ehie Rumuapara.", "keyFigures": ["Obio (Ancestor)", "Apara (Hunter)", "Evo (Senior brother)", "Kpalukwu Ada-Orlu (Mother of Rebisi)", "Orimohie (The Lost Son)"], "locations": ["Workpu (Rumuogba)", "Rumunkara", "Ehie Rumuapara"], "fullText": ["Apara and Evo were sons of the same father, Obio, of ancient Ikwerre origin. Evo was the first son while Apara was the second. Apara was an intrepid hunter who spent days traversing the wilderness. One fateful day while Apara was on a hunting expedition, their father Obio passed away.", "Upon returning and hearing the shocking news, Apara inquired of Evo what caused their father's sudden demise. Evo retorted harshly: \"How can you know what is happening at home when you are always wandering in the bush like a wild animal? You have no stake in our father's wealth. Go look for your portion in the bush!\"", "Offended by this denial of his birthright—especially as he had always presented the choicest parts of his game to Evo—the two brothers took up arms. In the ensuing civil conflict, sons and daughters were lost. Because of this historic war, to this day, Apara does not ask for or receive the right forelimb (Aka Ikunga Anu Ohia) of any slaughtered animal in Evo, and vice versa.", "Apara migrated southwards to Rumunkara in modern Rumuola, establishing the domain known as \"Ehie Rumuapara\". There, Apara fathered ten children: Ekinigbo (Rumuigbo), Epirikom (Rumuepirikom), Adaorlu (Rumuadaorlu), Eneka, Orosi, Rukporkwu, Ola (Rumuola), Okwuta (Rumuokwuta), Orimohie, and the youngest son, Rebisi (Retisi / Diobu).", "Orimohie, the stubborn ninth son, let loose a sacred beast called \"Mgbada\" that Apara was preparing for sacrifice to his personal god (chi). Banished until he recovered the beast, Orimohie never returned. Hence Apara became known as \"Apara Mgbu Tolu\" (Apara the father of nine sons)."], "historicalArtifact": {"name": "Aka Ikunga Anu Ohia", "description": "The right forelimb of any slaughtered animal in Ikwerre ceremonial life.", "significance": "Symbol of brotherly division; permanently excluded between Apara and Evo to commemorate the ancient dispute."}, "quizQuestion": {"question": "Why did Apara become known as \"Apara Mgbu Tolu\" (Apara of the Nine)?", "options": ["His ninth son Orimohie was banished after letting out the sacrificial Mgbada beast and never returned", "He only had nine sons originally", "Nine clans united under his royal sword", "He conquered nine foreign territories"], "correctIndex": 0, "explanation": "Orimohie was banished to find the lost sacrificial beast and never returned, leaving nine recognized clans in Apara."}}, {"id": "ch-2", "chapterNumber": 2, "title": "The Escape & Settlement at Olulu Rebisi", "period": "13th - 14th Century AD", "summary": "The assassination plot against Rebisi by his envious brothers, the heroic warning song of his wife Adanwanwo, sanctuary in Rumueme, and the miraculous crocodile spring of Ogbotu Mini Nkwo.", "keyFigures": ["Rebisi (Founder)", "Adanwanwo (Wife & Savior)", "Anwanwo (Father-in-law, Rumueme)", "Kpakani (Friend)", "Kpadeli / Ochiri", "Opuogulaya (Ogoloma Fisherman)"], "locations": ["Rumueme", "Olulu Rebisi (Polo Club, GRA Phase II)", "Ogbotu Mini Nkwo", "Ahiamakara (Trans-Amadi)"], "fullText": ["As time passed, older brothers Okwuta, Ola, and sister Ada-Apara conspired to murder their youngest brother Rebisi. His devoted wife, Adanwanwo, caught wind of the assassination plot. When Rebisi initially dismissed her warnings, she told him to listen closely while she pounded palm fruit with her feet.", "Rhythmically stamping the boiled palm fruits, she sang the chilling warning chant: \"Nzompi-nzompi, bogbulei taa, bogbui nu ekile\" (If they fail to kill you today, tomorrow is a certainty!). Instilled with realization, Rebisi fled to Rumueme to take refuge with his father-in-law, Anwanwo.", "When the conspirators arrived hunting for Rebisi, Anwanwo stood at his gate with a loaded dane gun, declaring: \"Why do you ask for your brother when you have already killed him elsewhere? Leave immediately or I will shoot you all!\" Rebisi had been hidden safely in a trench covered by firewood.", "Rebisi soon set out to establish his own independent homestead. In the wilderness near the present Polo Club in Port Harcourt (GRA Phase II), his friend Kpakani revealed a miraculous freshwater spring: \"Look before you; clean water is gushing out of a crocodile hole at the bottom of that palm tree!\" Rebisi named this sacred spring \"Ogbotu Mini Nkwo\".", "Here, he dug a pit to extract clay to build his very first house—giving the place its immortal name: \"Olulu Rebisi\" (The Pit Dug by Rebisi). Soon after, Rebisi befriended Kpadeli (\"Kpadasim Eli\" - assist me to develop this land), who took the name Ochiri. While hunting near Onumini Ordasiorlu, Rebisi met Opuogulaya, an Ijo/Okrika fisherman from Ogoloma.", "The two developed trade by barter: exchanging yams, plantains, and sacred \"abali\" reeds for fresh fish. They designated scheduled meeting days called \"Izu ma-karu\" (We shall meet on the appointed day), which gave birth to \"Ahiamakara\", the historic trading market of Port Harcourt!"], "historicalArtifact": {"name": "Ogbotu Mini Nkwo", "description": "The ancient freshwater crocodile-hole spring at the root of a sacred palm tree.", "significance": "Provided the life-giving water that allowed Rebisi to settle and establish the heart of Port Harcourt."}, "quizQuestion": {"question": "What song did Adanwanwo sing to warn Rebisi of the death plot?", "options": ["\"Nzompi-nzompi, bogbulei taa, bogbui nu ekile\" (If they fail today, tomorrow is a must)", "\"Otuwhuo gidim, ogidi na gba nkwa\"", "\"Meka su nwo, dieli\"", "\"Apara Mgbu Tolu\""], "correctIndex": 0, "explanation": "Her poetic warning sung while pounding palm fruit saved Rebisi's life and changed the destiny of the region."}}, {"id": "ch-3", "chapterNumber": 3, "title": "Territorial Acquisition & Inter-Tribal Wars", "period": "1730s AD", "summary": "The rise of the seven clans, the valor of hunter Elechi Nyeraa Wogbuji, victory over Rumuwopara, defense against Kalabari raids, and the conquest of Emeru.", "keyFigures": ["Elechi Nyeraa Wogbuji (Hero & Warlord)", "Obiekwe Sele", "Amakiri Obieli (Kalabari Ally)", "Chief Emeru"], "locations": ["Nkpolu Rebisi", "Odorogwu (Bakana)", "Emeru (Borikiri / Main Town)", "Ahiawelechi (Timber Waterside)"], "fullText": ["Rebisi and his wives bore seven sons and one daughter, whose lineages formed the Seven Communities of Rebisi: Olozu (Oro-Olozu / Elekahia), Worukwo (Oroworukwo), Abali (Oro-Abali), Ogbum (Orogbum), Kpadeli (Orochiri), Ezimgbu (Oromerezimgbu), and Ada (Oroada).", "As the settlement expanded, land disputes arose with neighboring tribes like Rumuwopara, Rumuezor, Rumudede, and Rumuchikwe. The legendary hunter and warrior Elechi Nyeraa Wogbuji, armed with a mystical protective preparation from Akaninwo of Rumueme that reportedly rendered him invisible to bullets, led the Rebisi campaign in the 1730s AD.", "Rumuwopara and its allies were routed across the river to Isaka island. To secure the frontiers, Rebisi established fortified forward outposts known as \"Nkpolu Rebisi\" (Nkpolu-Oroworukwo, Nkpolu-Abali, Nkpolu-Orogbum) stretching down to Elechi Beach.", "When Kalabari raiders from Bakana attempted incursions along the creeks at Rumuwoji (Mile 1 Diobu) and Rumuolumeni, Elechi and Obiekwe took the offensive, striking deep into enemy waters. The landing point in Bakana is called \"Odorogwu\" (the land that caused the war) to this day.", "Southward, in the dense coastal forests of Emeru, Rebisi forces surrounded Chief Emeru. To spare his life, Chief Emeru surrendered his sacred insignia of spiritual and political authority—the ancient \"Owhor of Emeru\"—which is preserved in the custody of Egwuma-Abali to this day.", "Later, Elechi forged an alliance with King Amakiri Obieli of Kalabari, inaugurating the \"Oath of Trust\" and establishing the thriving coastal trading post \"Ahiawelechi\" by the Timber Waterside."], "historicalArtifact": {"name": "The Sacred Owhor of Emeru", "description": "The ancient wooden and iron staff of political and spiritual supremacy surrendered by Chief Emeru.", "significance": "Preserved by Egwumabali as proof of territorial ownership over Port Harcourt Main Town and Borikiri."}, "quizQuestion": {"question": "Which legendary Rebisi warrior led the 1730s defense against Rumuwopara and the Kalabaris?", "options": ["Elechi Nyeraa Wogbuji", "Chief Potts-Johnson", "Alexander George Boyle", "James Wiche"], "correctIndex": 0, "explanation": "Elechi Nyeraa Wogbuji was the fearless hunter-warrior who secured the territorial borders of Rebisi."}}, {"id": "ch-4", "chapterNumber": 4, "title": "Pre-Colonial Government & The Wanunu Police", "period": "Pre-Colonial Era", "summary": "The House System, the Oha Rebisi general assembly of chiefs and owhor-holders, traditional judicial trials, and the fierce Wanunu native police society.", "keyFigures": ["Ezebunwo Amadi-Nwondugba", "Eguma Ede of Orogbum", "Nde Eze Ikpe (Judges)"], "locations": ["Obiri Rebisi", "Obiri Odum (Orogbum)", "Oroworukwo Hall"], "fullText": ["Pre-colonial Rebisi was governed under a sophisticated confederated \"House System\". Each family head represented his lineage in the sovereign assembly termed \"Oha Rebisi\".", "Chieftaincy and spiritual leadership were intertwined: chiefs were the accredited holders of the sacred \"Owhor\", the ancestral staff of justice and truth. In matters of inter-communal diplomacy, outstanding orators such as Ezebunwo of Oroworukwo and Eguma Ede of Orogbum were appointed to represent the entire kingdom.", "Judicial proceedings were conducted publicly in the chief's palace (\"Obiri\"). Both complainant and accused paid ceremonial fees (\"Iwai otu-omu\" and summons runner fee \"Iwai izi\"). The hearing panel (\"Nde eze ikpe\") heard exhaustive statements and cross-examinations.", "In high-stakes accusations of poison or witchcraft, the accused was required to swear before the sacred deity Ruwhueli or Rukani. He was given a 12-month probationary period during which he was forbidden from cutting his hair; survival proved complete innocence.", "Law enforcement was executed by the \"Wanunu Society\"—the feared traditional Rebisi police force comprising energetic men and women of the age-grades. If a defaulter defied a judicial verdict, the Wanunu marched to his compound, lit a punitive fire, confiscated livestock for cooking on site, and enforced community compliance."], "historicalArtifact": {"name": "The Owhor Staff", "description": "Sacred branch of the sacred Detarium senegalense tree, carved with ancestral bindings.", "significance": "The ultimate symbol of truth, moral uprightness, and spiritual authority in all Ikwerre courts."}, "quizQuestion": {"question": "What was the traditional Rebisi law enforcement and police force called?", "options": ["The Wanunu Society", "The Oha Rebisi", "The Amangada Guild", "The Nde Eze Ikpe"], "correctIndex": 0, "explanation": "The Wanunu Society acted as the executive police force of Rebisi, carrying out rulings of the chiefs and age-grades."}}, {"id": "ch-5", "chapterNumber": 5, "title": "Deities, Shrines & The Sacred Libation", "period": "Ancient Traditions", "summary": "Spiritual beliefs in Chi-Okike, the ancestral shrine of Ruwhueli at Orolozu, the mystery of Wominirenwu Isiapa Ahia, and the solemn ritual of libation with the Ahio cow horn.", "keyFigures": ["Chi-Okike (Supreme Creator)", "Ruwhueli (Guardian Deity)", "Wominirenwu (Goddess of Market Road)", "Eze Epara Rebisi"], "locations": ["Ruwhueli Shrine (Orolozu / Rumukalagbor)", "Wominirenwu Stream (St. John's College)", "Ojukwu Diobu"], "fullText": ["The Rebisi people maintained profound faith in the Supreme Spirit and Creator, \"Chi-Okike\". Ancestral communion was mediated through deities and the veneration of the living dead through libations.", "The preeminent guardian deity of Rebisi is \"Ruwhueli Rebisi\", instituted by the founder himself at Orolozu (near Rumukalagbor). Ruwhueli is a holy power that tolerates no abominations, shedding of innocent blood, or deceit. Every year on \"Riagbo Day\", the seven communities assemble for \"Osu Eli\" (Cleansing of the Land), sacrificing a male cow.", "The sacred deity \"Wominirenwu\" originated when Rebisi brought a protective presence from Akami in Akpor to safeguard Ahiamakara market. On the return journey, a divine eagle feather dropped along the market footpath behind St. John's College. A soothsayer announced that Wominirenwu loved Rebisi and had chosen to make her eternal home there.", "Libation in Rebisi is strictly structured. In the Oha Rebisi assembly, all representatives lay their hands upon the \"Ahio\" (a polished hollow cow horn filled with palm wine or spirits). The eldest son from Olozu speaks the invocations while all respond in unison.", "Ochiri holds the exclusive privilege of performing libations before any cow is slaughtered in burial ceremonies, fulfilling Rebisi's ancient decree commemorating his martial honor."], "historicalArtifact": {"name": "The Ahio Cow Horn", "description": "Polished hollow horn of a consecrated bull, bound with woven fibers.", "significance": "Held collectively by representatives of all seven clans during national libations to ensure unbroken unity."}, "quizQuestion": {"question": "Where is the supreme guardian shrine of Ruwhueli Rebisi located?", "options": ["At Orolozu (near Rumukalagbor)", "In the deep swamps of Bakana", "At Eagle Island beach", "At the entrance of Rumueme"], "correctIndex": 0, "explanation": "Ruwhueli was established by Rebisi at Orolozu (now near Rumukalagbor) and its Chief Priesthood remains with the Olozu lineage."}}, {"id": "ch-6", "chapterNumber": 6, "title": "Festivals, Wrestling & The Five Market Days", "period": "Cultural Cycles", "summary": "The seasonal rhythms of traditional wrestling (Ngerenge, Egelege ehihie, Egelege orah), the five market days, the Ojiji fattening room, and the marriage rites.", "keyFigures": ["Egelege Wrestlers", "Ojiji Maidens", "Nde Rimene (Maternal Kinsmen)"], "locations": ["Ahiamakara", "Weja Waterfront (Elekahia)", "Elechi Beach", "Chief John Ogbonda Street (Orogbum)"], "fullText": ["Wrestling (\"Urtnah\" / \"Egelege\") was the supreme athletic yardstick in Rebisi. It operated in three progressive seasons: \"Ngerenge abali\" (night wrestling in April/May), \"Egelege ehihie\" (inter-village afternoon matches in June/August), and \"Egelege orah\" (the grand 7-day championship festival during new yam harvest).", "The Rebisi week is divided into five distinct market days: Asaragbo (the largest market day at Ahiamakara), Riagbo (the sacred holy day when no farm or fishing work occurs; dying on Riagbo is an abomination requiring oracle rites), Eberi (post-holiday market day at Ahia Elechi), Nmakara (\"let it be as scheduled\" at Weja Waterfront), and Nnim (the bustling final day of the week at Ahia Wadaonunu).", "Marriage was a multi-stage communal covenant: \"Manya osikwa nwere\" (presentation of wine on Eberi day), followed by the binding \"Manya ogbaonu\" where bride and groom drink from the same wooden cup.", "Young women entered the \"Ojiji\" fattening room for up to six months, adorning their hair in \"Ojongo\" style and wrapping their shins in heavy brass \"Echi\" coils. On the excursion day, the bride was carried shoulder-high to her husband's home amidst Eregbu drumming."], "historicalArtifact": {"name": "Echi Brass Coils", "description": "Heavy spiral metal coils worn on the shins of maidens graduating from the Ojiji fattening room.", "significance": "Represented feminine beauty, wealth, chastity, and readiness for royal marriage."}, "quizQuestion": {"question": "Which day of the Rebisi 5-day week is the sacred \"holy day\" when all farming stops?", "options": ["Riagbo", "Asaragbo", "Eberi", "Nnim"], "correctIndex": 0, "explanation": "Riagbo is the holy day dedicated to family communion, palm-wine sharing, and appeasement of Ruwhueli."}}, {"id": "ch-7", "chapterNumber": 7, "title": "Occupations: Land Rotation & Fishing Ports", "period": "Traditional Economy", "summary": "The communal agricultural system with 7 to 8 year fallow cycles, the Ngweta cooperative labor guilds, and the riverine fishing ports that became Port Harcourt.", "keyFigures": ["Yam Farmers", "Palm Wine Tappers", "Riverine Fishermen"], "locations": ["Eli-Gbori (Gbolokiri)", "Sombi (Marine Base)", "Ohiakwu (Eagle Island)", "Omaemeru (Golf Course)"], "fullText": ["Farming was the principal occupation of the Rebisi people. The kingdom practiced an advanced land rotation system where farmlands were left fallow for seven to eight years to ensure complete replenishment of soil nutrients.", "To cultivate vast acreages, the people relied on \"Ngweta\"—a reciprocal cooperative labor institution where families and age-grades rotated across each other's farms to clear bushes, mound yam heaps, and harvest together.", "Fishing was equally paramount. The Rebisi maintained major coastal fishing ports (\"Gbori\") across the waterways: Ohiamati, Sombi (Marine Base), Omaemeru (near the modern Golf Course), Osokwuohia (Ndoki Waterside), Tugbo (Creek Road Waterside), and Ohiakwu (Eagle Island).", "They engineered specialized indigenous fishing gears: Mgbala (bamboo tidal traps up to 6 feet wide), Igbor (weighted cast nets), Ekete (wire mesh maze traps), Ikata (soft woven shrub traps for mudskippers), and Arii (iron bait hooks)."], "historicalArtifact": {"name": "Mgbala Fish Trap", "description": "Woven bamboo tidal weir reinforced with plant twine.", "significance": "Allowed sustainable harvesting of fish across tidal creek estuaries without depleting fingerlings."}, "quizQuestion": {"question": "How many years did Rebisi farmers typically leave agricultural land fallow to preserve soil vitality?", "options": ["7 to 8 years", "1 to 2 years", "20 years", "No fallow period"], "correctIndex": 0, "explanation": "Rebisi maintained a 7-8 year land rotation cycle because arable land was abundant and soil conservation was vital."}}, {"id": "ch-8", "chapterNumber": 8, "title": "The British Intrusion & The 1913 Treaty on Ship \"IVY\"", "period": "1911 - 1928 AD", "summary": "The compulsory British colonial seizure of Diobu Rebisi farmlands, the kidnapping of seven chiefs onto the warship IVY, the brave 15-year refusal of purchase money, and the 1928 Perpetual Lease.", "keyFigures": ["Chief Wobo (Rumuwoji)", "Chief Ezebunwo (Oroworukwo)", "Chief Ogbonda Elikwu (Orolozu)", "Alexander George Boyle (Colonial Governor)", "Sir Graeme Thompson"], "locations": ["Atlantic Ocean (40 miles offshore)", "Abonnema Wharf (Ohia Widiabor)", "Gbor-gbor (Amadi Flats)"], "fullText": ["In 1911, the British colonial administration surveyed Rebisi farmlands and presented a petition before the House of Commons in London seeking to acquire the Rebisi cliffs for a railway terminus and deep-water port (named after colonial secretary Lewis Harcourt).", "In 1913, seven illiterate but resolute chiefs representing the seven communities of Rebisi were persuaded to board the Man-of-War steamship \"IVY\" under the pretext of going to Degema to negotiate leasing their lands. Instead, the warship steamed 40 nautical miles out into the Atlantic Ocean and dropped anchor.", "Surrounded by naval guns, the chiefs were coerced with threats of execution and exile if they refused to thumbpress an English document ceding their ancestral homeland. Chief Elikwu counseled his fellow elders: \"Let us thumbpress to escape alive, for once back on land, all avenues of resistance remain open to us.\"", "Upon their return, the Rebisi people vehemently rejected the \"Outright Sale and Purchase\" agreement. In an act of unparalleled defiance, the Rebisi chiefs REFUSED TO TOUCH A SINGLE PENNY of the colonial purchase money for FIFTEEN CONSECUTIVE YEARS (1913–1928)!", "When British authorities disarmed them at Oroworukwo village by breaking their dane guns and offering them a bullet or a yam tuber, the elders proudly took the yam to signal their desire for righteous peace. Meanwhile, they waged chemical resistance, pouring venom into the British well at Ohia Widiabor (Abonnema Wharf).", "Faced with 15 years of steadfast legal and spiritual refusal, Governor Sir Graeme Thompson finally capitulated on behalf of the King of England, signing the historic 1928 \"Supplemental Agreement\" converting the acquisition from outright sale to a perpetual annual lease!"], "historicalArtifact": {"name": "The 1928 Supplemental Agreement Deed", "description": "Memorandum of Agreement dated 2nd May, 1928 (Reg. No. 35, Vol. 99, Page 230, Lagos Land Registry).", "significance": "Vindicated Rebisi sovereignty by legally converting British expropriation into an ongoing perpetual leasehold."}, "quizQuestion": {"question": "How did the seven Rebisi chiefs show their refusal to sell their ancestral land to the British?", "options": ["They refused to collect the colonial purchase money for 15 straight years (1913–1928)", "They burned down the colonial secretariat in London", "They migrated to the Cameroon mountains", "They signed an outright deed of gift"], "correctIndex": 0, "explanation": "Their 15-year total boycott of the purchase money forced the British Crown to concede and sign the 1928 Perpetual Lease Agreement."}}, {"id": "ch-9", "chapterNumber": 9, "title": "The Age-Grade System & Modern Renaissance", "period": "20th Century to Present", "summary": "The evolution from pre-colonial youth defense leagues to the Owhor Esawu Rebisi, the registration of Rebisi Age Grade No. 1, and the Central Age Group Council (Omaruta Rebisi).", "keyFigures": ["Chief Geora Nsiegbe", "Wilson Ogoloma", "Benjamin Nyeche Chinwo", "Chief Okogbule Wonodi"], "locations": ["Port Harcourt City Local Government", "Diobu", "Trans-Amadi Layout"], "fullText": ["The age-grade system in Rebisi served as the backbone of social welfare, civic order, and defensive mobilization. Historically organized in 1-to-5-year birth cohorts, age-grades constructed roads, defended boundaries, and enforced moral ethics alongside the Wanunu society.", "In the late 1950s, the seven communities united under \"Owhor Esawu Rebisi\" (The Seven Owhor of Rebisi), bringing about uniform democratic consensus across all seven towns.", "Following the Nigerian Civil War, prominent leaders established \"Rebisi Age Grade No. 1\" in the early 1970s. This sparked a cultural renaissance across Diobu, giving rise to modern registered groups including \"Omaruta Rebisi\" (\"Getting to know ourselves\", founded 1981).", "Today, the Central Age Group Council operates as a vital pillar of local governance—building schools, awarding university scholarships, preserving historical records, and defending the ancestral heritage of Rebisi as the rightful indigenous landlords of Port Harcourt."], "historicalArtifact": {"name": "The Clasp of Hands (Omaruta Insignia)", "description": "The iconic emblem of interlocking hands framed by traditional cowrie and leaf patterns.", "significance": "Embodies the motto \"Getting to know ourselves\", representing cultural renewal and ancestral unity."}, "quizQuestion": {"question": "What does the age group name \"Omaruta Rebisi\" mean?", "options": ["\"Getting to know ourselves\"", "\"Warriors of the seven clans\"", "\"The traders of Ahiamakara\"", "\"The golden yams of Diobu\""], "correctIndex": 0, "explanation": "\"Omaruta Rebisi\" translates directly to \"getting to know ourselves\", dedicated to historical preservation and mutual fellowship."}}, {"id": "ch-10", "chapterNumber": 10, "title": "The Eternal Heritage of Rebisi", "period": "Present & Beyond", "summary": "A reflection on eight centuries of survival, the seven clans that birthed Port Harcourt Urban City, and the sacred imperative to speak the language and honor the ancestors.", "keyFigures": ["Rumu-Rebisi", "Eze Risi Ohia", "Paramount Chiefs & Elders"], "locations": ["Port Harcourt Local Government Area (Whole Mainland)"], "fullText": ["For more than eight hundred years, the descendants of Rebisi have nurtured, defended, and inhabited the lush riverine peninsula of Obomotu. Today, the modern metropolis of Port Harcourt stands entirely upon the ancestral farmlands, fishing ports, and sacred groves of Rebisi.", "From the royal seat of Olozu and the sword of Amangada, to the bustling markets of Ahiamakara and the coastal shores of Emeru and Eagle Island, the heritage of Rebisi remains unbroken.", "As language and culture face the pressures of urbanization, the teachings preserved in the \"Ormumuh Ikwu-Onu Emohua\" and the \"Historical Account of Rebisi\" call upon the new generation to rise, learn the spoken tongue, recite the proverbs, and stand tall as proud Dieli (True Born of the Land)!"], "historicalArtifact": {"name": "Amangada Royal Sword of Rebisi", "description": "The ancient steel rapier inherited by Olozu from Rebisi.", "significance": "The crowning insignia of royal chieftaincy and the sovereign soul of Rebisi kingdom."}, "quizQuestion": {"question": "What was the original indigenous name of the land today known as Port Harcourt?", "options": ["Obomotu", "Bakana", "Degema", "Okpokia"], "correctIndex": 0, "explanation": "Obomotu was the ancient name of Rebisi's farmlands and coastal fishing territory before British colonial renaming."}}], "sites": [{"id": "site-1", "name": "Olulu Rebisi (Founding Homestead)", "modernName": "Polo Club Field, GRA Phase II, Port Harcourt", "ikwerreSignificance": "The original excavation pit where Rebisi dug clay to mold his very first dwelling.", "coordinates": {"x": 38, "y": 32}, "description": "The birthplace of Rebisi township where the founder and his wife Adanwanwo first made their sovereign home after escaping the death plot.", "clanAssociation": "Founded by Rebisi, inherited by Olozu"}, {"id": "site-2", "name": "Ogbotu Mini Nkwo (Sacred Crocodile Spring)", "modernName": "Near Ohiamini / GRA II", "ikwerreSignificance": "The miraculous freshwater spring that burst from a crocodile hole under a palm tree.", "coordinates": {"x": 42, "y": 30}, "description": "Shown to Rebisi by his friend Kpakani, providing fresh drinking water. Appeased to this day by Oromerezimgbu.", "clanAssociation": "Oromerezimgbu (Ezimgbu)"}, {"id": "site-3", "name": "Ahiamakara Market Ground", "modernName": "Behind Akarolo Blocks, Trans-Amadi Industrial Layout", "ikwerreSignificance": "The legendary barter market established by Rebisi and Opuogulaya the Ogoloma fisherman.", "coordinates": {"x": 65, "y": 45}, "description": "Where \"Izu ma-karu\" (We shall meet on the appointed day) turned into the commercial epicenter of eastern Niger Delta, trading yams and abali reeds for marine fish.", "clanAssociation": "Pan-Rebisi Trading Ground"}, {"id": "site-4", "name": "Ruwhueli Rebisi Shrine", "modernName": "Orolozu, near Rumukalagbor (Behind INEC)", "ikwerreSignificance": "The supreme guardian deity and oath-taking sanctuary of all seven Rebisi clans.", "coordinates": {"x": 50, "y": 40}, "description": "Established by Rebisi himself upon relocating from Olulu Rebisi. Center of the annual \"Osu Eli\" land cleansing ceremony.", "clanAssociation": "Olozu (Chief Priesthood)"}, {"id": "site-5", "name": "Emeru Territory & Waterside", "modernName": "Borikiri / Port Harcourt Main Town", "ikwerreSignificance": "Conquered territory where Chief Emeru surrendered the sacred Owhor staff of office to Egwuma-Abali.", "coordinates": {"x": 55, "y": 80}, "description": "Ancient farmlands and fishing domains extending to Eli-Gbori (Gbolokiri) and New Layout Market.", "clanAssociation": "Oro-Abali & Orogbum"}, {"id": "site-6", "name": "Nkpolu Outposts (Nkpolu-Rugburuodor)", "modernName": "Mile 3 Diobu & UST Abuja Campus", "coordinates": {"x": 28, "y": 50}, "ikwerreSignificance": "Strategic warrior outposts established in the 1730s to shield Rebisi from Western incursions.", "description": "Frontier settlements of Oroworukwo, Abali, and Orogbum warriors guarding the creeks from Elechi Beach to Rumuolumeni.", "clanAssociation": "Nkpolu-Oroworukwo, Nkpolu-Abali, Nkpolu-Orogbum"}, {"id": "site-7", "name": "Ohia Widiabor (Site of Resistance)", "modernName": "Abonnema Wharf, Port Harcourt", "ikwerreSignificance": "Where Rebisi warriors poisoned the colonial well in defiance of the forced 1913 treaty.", "coordinates": {"x": 22, "y": 68}, "description": "A key coastal battleground against colonial expropriation during the 15-year purchase money boycott.", "clanAssociation": "Rumuwoji & Rebisi Warriors"}, {"id": "site-8", "name": "Gbor-Gbor (Amadi Flat)", "modernName": "Amadi Flats / Old Railway Station", "ikwerreSignificance": "The settlement where Oroije relocated following the peace settlement at Obiri Odum.", "coordinates": {"x": 62, "y": 60}, "description": "Scene of historical unity between Oroije, Egwuma-Abali, and the allied chiefs of Okrika and Rumueme.", "clanAssociation": "Oroije (Abali)"}], "clans": [{"id": "olozu", "name": "Orolozu (Elekahia)", "ancestor": "Olozu (First Surviving Son)", "allottedShare": "Otu-ochi-ha (Right back-hind) & Head of slaughtered animals", "sacredRole": "Chief Priesthood of Ruwhueli & Custodians of the Royal Amangada Sword", "subVillages": ["Oro-Awhorlu", "Oro-Ordunwenyeoma", "Oro-Echichinwo", "Oro-Gbom"]}, {"id": "worukwo", "name": "Oroworukwo", "ancestor": "Worukwo (Second Son, named after Ogoloma friend)", "allottedShare": "Osoha (Diaphragm)", "sacredRole": "Diplomatic Convener of Oha Rebisi with Orogbum", "subVillages": ["Oro-Wokogoloma", "Oro-Ora", "Oro-Ovunwo", "Oro-Enyika"]}, {"id": "abali", "name": "Oro-Abali", "ancestor": "Abali (Son of Gada, named after the abali reed)", "allottedShare": "Front part of Ochi-hake-ebor (Left back-hind) & Entrails of all animals", "sacredRole": "Holders of the sacred Owhor of Emeru & Okporo traditional royal dance", "subVillages": ["Egwuma-Abali", "Oro-Ije (Ijee-Wekpor)", "Orianwo", "Oro-Ada Abali"]}, {"id": "ogbum", "name": "Orogbum", "ancestor": "Ogbum (Son of Gada, meaning \"safe in father-in-law's custody\")", "allottedShare": "Leftover of front hind (Otu-akaha)", "sacredRole": "Conveners of Oha Rebisi at Obiri Odum & Peace Arbitrators", "subVillages": ["Chukwu-Okah", "Sele"]}, {"id": "ochiri", "name": "Oro-Ochiri (Kpadeli)", "ancestor": "Kpadeli / Ochiri (\"Assist me to develop this land\")", "allottedShare": "The Neck of any slaughtered animal (Sign of everlasting friendship)", "sacredRole": "Sole rights of libation before funeral cow slaughter & palm-wine sharing in Obiri", "subVillages": ["Woluchor", "Kalagbor"]}, {"id": "ezimgbu", "name": "Oromerezimgbu", "ancestor": "Ezimgbu (\"My compound should live and expand forever\")", "allottedShare": "Leftover of Ochi-hake-ebor (Left back-hind)", "sacredRole": "Custodians of Ogbotu Mini Nkwo crocodile spring rites", "subVillages": ["Rumu-Rewha", "Rumu-Ikegwueli", "Rumu-Imeni"]}, {"id": "oroada", "name": "Oroada (Ada-Rebisi / Nyege)", "ancestor": "Ada-Rebisi (\"Adasobia\", kept unmarried to perpetuate lineage)", "allottedShare": "Front part of Otu-akaha (One of the front hinds)", "sacredRole": "Royal sharing of hot drinks in Obiri Rebisi & maternal pillar", "subVillages": ["Ogbonda", "Odum", "Wogbom", "Mgbada"]}]};
function phon(word){
 const CM={b:['b','b'],ch:['ch','tS'],d:['d','d'],f:['f','f'],g:['g','g'],gb:['gb','gb'],gh:['gh','g'],gw:['gw','gw'],h:['h','h'],j:['j','dZ'],k:['k','k'],kp:['kp','kp'],kw:['kw','kw'],l:['l','l'],m:['m','m'],n:['n','n'],'ṅ':['ng','N'],nw:['nw','Nw'],ny:['ny','n^'],p:['p','p'],r:['r','r'],s:['s','s'],sh:['sh','S'],t:['t','t'],v:['v','v'],w:['w','w'],wh:['hw','hw'],y:['y','j'],z:['z','z']};
 const VM={a:['ah','a'],e:['eh','e'],'ẹ':['eh','e'],i:['ee','i'],'ị':['ih','I'],o:['oh','o'],'ọ':['aw','O'],u:['oo','u'],'ụ':['u','U']};
 const DI=['kp','gb','gw','kw','nw','ny','gh','ch','sh','wh'];
 const s=String(word).normalize('NFD').toLowerCase().replace(/[\u0300\u0301\u0302\u0304\u030c]/g,'').normalize('NFC');
 const out=[];
 String(s).split(/[\s.,?!]+/).filter(Boolean).forEach(wd=>{const seg=wd.replace(/['’\-]+/g,'');
  const tk=[];
  for(let i=0;i<seg.length;i++){const d=seg.slice(i,i+2);
   if(DI.includes(d)){tk.push({c:1,n:d,r:CM[d][0],p:CM[d][1]});i++}
   else if(CM[seg[i]])tk.push({c:1,n:seg[i],r:CM[seg[i]][0],p:CM[seg[i]][1]});
   else if(VM[seg[i]]){const L=tk[tk.length-1];if(L&&!L.c&&L.n===seg[i]&&!L.l){L.l=1;L.r+=L.r.slice(-1);L.p+=':'}else tk.push({c:0,n:seg[i],r:VM[seg[i]][0],p:VM[seg[i]][1]})}}
  for(let i=tk.length-1;i>0;i--)if(tk[i].c&&tk[i-1].c&&tk[i].n===tk[i-1].n&&!['m','n','ṅ'].includes(tk[i].n))tk.splice(i,1);
  const sy=[];let cur=null,pend=[];
  const nas=t=>['m','n','ṅ'].includes(t.n);
  tk.forEach(t=>{
   if(t.c){pend.push(t);return}
   let on=pend;
   if(pend.length>1){
    if(nas(pend[0])&&!nas(pend[1]))on=pend;
    else{const co=pend.slice(0,-1);on=pend.slice(-1);
     if(cur)co.forEach(x=>{cur.r+=x.r;cur.p+=x.p});else co.forEach(x=>sy.push({r:x.r,p:x.p}));}
   }
   cur={r:on.map(x=>x.r).join('')+t.r,p:on.map(x=>x.p).join('')+t.p};sy.push(cur);pend=[];
  });
  if(pend.length){if(cur)pend.forEach(x=>{cur.r+=x.r;cur.p+=x.p});else pend.forEach(x=>sy.push({r:x.r,p:x.p}))}
  if(sy.length)out.push({r:sy.map(x=>x.r).join('-'),p:sy.map(x=>'%'+x.p).join('')});
 });
 return{resp:out.map(x=>x.r).join(' '),ipa:out.map(x=>x.p).join(' ')};
}

const pron=t=>{try{return phon(t).resp}catch(e){return''}};
const courseText = loadCourse(COURSE);

courseText.split('\n').forEach((line) => {
  line = line.trim();
  if (!line) return;

  if (line[0] === '#') {
    U.push({ t: line.slice(1).trim(), w: [] });
  } else if (U.length && line.includes('=')) {
    const separator = line.indexOf('=');
    U[U.length - 1].w.push([
      line.slice(0, separator).trim(),
      cleanMeaning(line.slice(separator + 1)),
    ]);
  }
});

U.forEach((unit, index) => {
  unit.sourceIndex = index;
});

const CURATED = [
  {
    id: 'starter-words',
    t: 'Useful words to start with',
    w: [
      ['Mini', 'Water'],
      ['Bia', 'Come'],
      ['Ahia', 'Market'],
      ['Ọbọchi', 'Day'],
    ],
  },
  {
    id: 'starter-home',
    t: 'Build a home word family',
    guide: 'home',
    w: [
      ['Ọrọ', 'Home'],
      ['Ọrọ-ọkwkwọ', 'School'],
      ['Ọrọ-wụri', 'Kitchen'],
      ['Ọrọ-chiọkike', 'Church'],
    ],
  },
  {
    id: 'starter-good',
    t: 'Spot the “good” ending',
    guide: 'good',
    w: [
      ['Ehi-he-oma', 'Good Afternoon'],
      ['Mgbe-da-chi-oma', 'Good Evening'],
      ['Ibọla', 'Good Morning'],
      ['Abu-ochi', 'Good night'],
    ],
  },
  {
    id: 'starter-family',
    t: 'Recognize family words',
    guide: 'family',
    w: [
      ['Wene', 'Relations or relatives'],
      ['Wene-Rụka', 'Brother'],
      ['Wene-Riya', 'Sister'],
      ['Rụmụ-wenem', 'Siblings'],
    ],
  },
  {
    id: 'starter-numbers',
    t: 'Build a number you can use',
    guide: 'numbers',
    w: [
      ['Iri', '10'],
      ['Ọtụ', '1'],
      ['Ebụọ', '2'],
      ['Iri-nụ-ọtụ', '11'],
    ],
  },
];

const foldWord = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const sourceWords = new Map();

U.forEach((unit) => {
  unit.w.forEach((word) => {
    const key = foldWord(word[0]);
    if (!sourceWords.has(key)) sourceWords.set(key, word);
  });
});

CURATED.forEach((unit) => {
  unit.w = unit.w.map((word) => {
    const sourceWord = sourceWords.get(foldWord(word[0]));
    return sourceWord ? [word[0], sourceWord[1]] : word;
  });
});
U.unshift(...CURATED);
/* ===== Progress and lesson data ===== */
const LS = [];
U.forEach((unit, unitIndex) => {
  const lessonCount = Math.max(1, Math.floor(unit.w.length / 4));
  for (let lessonIndex = 0; lessonIndex < lessonCount; lessonIndex++) {
    LS.push({
      id: unit.id || `${unit.sourceIndex}-${lessonIndex}`,
      u: unitIndex,
      n: lessonIndex + 1,
      w: unit.w.slice(
        lessonIndex * 4,
        lessonIndex === lessonCount - 1 ? undefined : lessonIndex * 4 + 4
      ),
      guide: unit.guide,
    });
  }
});

const ALL = uniqueWordsByIkwerre(U.flatMap((unit) => unit.w), foldWord);
const createDefaultProgress = () => ({
  xp: 0,
  streak: 0,
  last: '',
  done: {},
  goal: 20,
  xpToday: 0,
  day: '',
  lt: 0,
  pt: 0,
  mtMs: 0,
  miss: [],
  days: [],
  ob: 0,
  snd: 1,
});
const savedProgress = loadProgress();
let S = { ...createDefaultProgress(), ...savedProgress };
if (!Number.isFinite(savedProgress.mtMs) || savedProgress.mtMs < 0) {
  S.mt = 0;
  S.mtMs = 0;
}

const save = () => saveProgress(S);
const dstr = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = () => dstr(new Date());

function roll() {
  const currentDay = today();
  const yesterday = dstr(new Date(Date.now() - 864e5));

  if (S.day !== currentDay) {
    S.day = currentDay;
    S.xpToday = 0;
    S.lt = 0;
    S.pt = 0;
    S.mt = 0;
    S.mtMs = 0;
  }

  if (
    (!S.last && S.streak !== 0) ||
    (S.last && S.last !== currentDay && S.last !== yesterday && S.streak !== 0)
  ) {
    S.streak = 0;
    save();
  }
}

const $ = (selector) => document.querySelector(selector);
const sh = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const norm = foldWord;
let tab = 'learn';
let L = null;
let step = Number.isInteger(S.onboardingStep)
  ? Math.min(7, Math.max(0, S.onboardingStep))
  : 0;
let authMode = 'signin';
let authName = '';
let authEmail = '';
let authMessage = '';
let authMessageType = 'error';
let authBusy = false;
let passwordResetToken = '';
let accountUser = null;
const guestAccessEnabled = import.meta.env.DEV;
let adminSummaryData = null;
let adminLoading = false;
let adminError = '';
let previewMode = false;
let forceOnboardingPreview = false;
let why = S.why || '';
const PATTERN_GUIDES={
 home:{title:'One familiar start: Ọrọ',intro:'Ọrọ means “home.” Notice how it begins several useful place words. Learn each full word; the source does not give a separate meaning for every ending.',rows:[
  {parts:['Ọrọ','ọkwkwọ'],meaning:'Ọrọ-ọkwkwọ · school'},
  {parts:['Ọrọ','wụri'],meaning:'Ọrọ-wụri · kitchen'},
  {parts:['Ọrọ','chiọkike'],meaning:'Ọrọ-chiọkike · church'}
 ],note:'A shared beginning is a memory clue—not a rule that lets us guess every compound.'},
 good:{title:'A reusable clue: -oma',intro:'In these forms, -oma is the reusable part linked to “good”; the rest identifies the greeting. Use it as a pattern clue, not a guarantee for every word.',rows:[
  {parts:['Ehi-he','-oma'],meaning:'Good afternoon'},
  {parts:['Mgbe-da-chi','-oma'],meaning:'Good evening'}
 ],note:'Good morning is listed as Ibọla, which does not visibly share -oma. Keep Ibọla as a whole greeting rather than forcing a split. A fluent speaker can confirm the exact word parts.'},
 family:{title:'Wene shows up in family words',intro:'Wene is listed as “relations” or “relatives.” It recurs at the start of these words for people close to you.',rows:[
  {parts:['Wene','-Rụka'],meaning:'Wene-Rụka · brother'},
  {parts:['Wene','-Riya'],meaning:'Wene-Riya · sister'}
 ],note:'The list gives the full meanings; it does not define the endings on their own.'},
 numbers:{title:'Build eleven from familiar numbers',intro:'Start with the listed numbers ten and one, then notice how the source writes eleven.',rows:[
  {parts:['Iri'],meaning:'10'},
  {parts:['Ọtụ'],meaning:'1'},
  {parts:['Iri','-nụ-','Ọtụ'],meaning:'Iri-nụ-ọtụ · 11'}
 ],note:'The pattern helps you remember eleven. The source does not give nụ a separate gloss here.'}
};
/* ===== Audio and recording ===== */
let ac;
function beep(frequency, duration = 0.12, type = 'sine') {
  if (!S.snd) return;

  try {
    ac = ac || new AudioContext();
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gain.gain.value = 0.07;
    oscillator.connect(gain);
    gain.connect(ac.destination);
    oscillator.start();
    oscillator.stop(ac.currentTime + duration);
  } catch (e) {}
}

const sOk = () => {
  beep(660);
  setTimeout(() => beep(880), 90);
};
const sNo = () => beep(180, 0.25, 'square');
const AUD = {};
let idb;
let recK = null;
let mr = null;
let ch = [];

function db() {
  return (
    idb ||
    (idb = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('ikw_audio', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('a');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject();
      } catch (e) {
        reject(e);
      }
    }))
  );
}

async function aget(key) {
  try {
    const database = await db();
    return await new Promise((resolve) => {
      const request = database.transaction('a').objectStore('a').get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve();
    });
  } catch (e) {}
}

async function aput(key, blob) {
  try {
    const database = await db();
    await new Promise((resolve) => {
      const transaction = database.transaction('a', 'readwrite');
      transaction.objectStore('a').put(blob, key);
      transaction.oncomplete = resolve;
      transaction.onerror = resolve;
    });
    AUD[key] = blob;
  } catch (e) {
    toast('Could not save audio on this device.');
  }
}

async function aload() {
  try {
    const database = await db();
    const store = database.transaction('a').objectStore('a');
    const [keys, values] = await Promise.all([
      new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
    ]);
    keys.forEach((key, index) => (AUD[key] = values[index]));
  } catch (error) {
    console.error('Could not load saved word recordings.', error);
  }
}

const ttsOK = () => typeof speechSynthesis !== 'undefined';
const canSay = (word) => !!AUD[word] || ttsOK();

async function say(word, slow) {
  talk();
  try {
    speechSynthesis.cancel();
  } catch (e) {}

  const cachedRecording = AUD[word];
  const recording =
    cachedRecording instanceof Blob
      ? cachedRecording
      : cachedRecording
        ? await aget(word)
        : null;
  if (recording) {
    const url = URL.createObjectURL(recording);
    const audio = new Audio(url);
    const releaseUrl = () => URL.revokeObjectURL(url);
    audio.addEventListener('ended', releaseUrl, { once: true });
    audio.addEventListener('error', releaseUrl, { once: true });
    if (slow) audio.playbackRate = 0.7;
    audio.play().catch((error) => {
      releaseUrl();
      console.error('Could not play the saved word recording.', error);
    });
    return;
  }

  const voices = (() => {
    try {
      return speechSynthesis.getVoices();
    } catch (e) {
      return [];
    }
  })();
  const ikwerreVoice = voices.find((voice) => /^ig/i.test(voice.lang));
  const englishVoice =
    S.apx === 0
      ? null
      : voices.find((voice) => /^en[-_]NG/i.test(voice.lang)) ||
        voices.find((voice) => /^en[-_](GB|ZA|IN|AU)/i.test(voice.lang)) ||
        voices.find((voice) => /^en/i.test(voice.lang));
  const voice = ikwerreVoice || englishVoice;

  if (typeof speechSynthesis !== 'undefined') {
    const utterance = new SpeechSynthesisUtterance(
      ikwerreVoice ? word : pron(word)
    );
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = slow ? 0.6 : 0.85;
    speechSynthesis.speak(utterance);
  }
}

async function toggleRec(key) {
  if (recK) {
    mr && mr.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mr = new MediaRecorder(stream);
    ch = [];
    recK = key;
    mr.ondataavailable = (event) => ch.push(event.data);
    mr.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      await aput(key, new Blob(ch, { type: mr.mimeType }));
      recK = null;
      toast(`Saved “${key}”`);
      render();
    };
    mr.start();
    render();
  } catch (e) {
    recK = null;
    toast('Microphone unavailable here. Use the ⬆ button to import a clip.');
  }
}

/* ===== Hub navigation and shared markup ===== */
let hub = null;
let hq = null;
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const bk =
  '<div class=lh><button class=x data-a=hubback aria-label="Back">\u2190</button></div>';
function hubv(){
 if(hub&&hub.k==='ch'){const c=EX.history[hub.i],q=c.quizQuestion;
  return bk+`<h2>${esc(c.title)}</h2><p class=mu>${esc(c.period)}</p>`+c.fullText.map(t=>`<p>${esc(t)}</p>`).join('')+(c.keyFigures&&c.keyFigures.length?`<div class=card><b>Key figures</b><p class=mu>${c.keyFigures.map(esc).join(' \u00b7 ')}</p></div>`:'')+(q?`<div class=card><b>Check yourself</b><p>${esc(q.question)}</p>${q.options.map((o,j)=>`<button class="opt ${hq!=null&&j===q.correctIndex?'sel':''}" data-a=hq data-v="${j}">${esc(o)}</button>`).join('')}${hq!=null?`<p class=mu>${hq===q.correctIndex?'Correct. ':'Not quite. '}${esc(q.explanation)}</p>`:''}</div>`:'')}
 if(hub){const s=EX.stories[hub.i];return bk+`<h2>${esc(s.titleEnglish)}</h2><p class=mu>${esc(s.titleIkwerre)}</p><p>${esc(s.summary)}</p>`+s.paragraphs.map(p=>`<div class=card>${p.speaker?`<div class=mu>${esc(p.speaker)}</div>`:''}<b>${esc(p.ikwerre)}</b><div class=mu>${esc(p.english)}</div></div>`).join('')+`<div class=card><b>Moral</b><p class=mu>${esc(s.moralLesson)}</p></div>`}
 const pv=EX.proverbs[Math.floor(Date.now()/864e5)%EX.proverbs.length];
 return topbar()+`<h2>Hub</h2><h2>Rebisi history</h2>`+EX.history.map((c,i)=>`<button class=opt data-a=hubopen data-k=ch data-v=${i}><b>${c.chapterNumber}. ${esc(c.title)}</b><div class=mu>${esc(c.period)}</div></button>`).join('')+`<h2>Other dialect: Emohua</h2><p class=mu>These come from a book in the Emohua dialect. Words can differ from Rebisi Ikwerre, so treat them as secondary.</p><div class=card><div class=mu style="font-size:12px;text-transform:uppercase">Today\u2019s proverb</div><b>${esc(pv.ikwerre)}</b><p>${esc(pv.english)}</p><p class=mu>${esc(pv.meaning)}</p></div><h2>Moonlight tales</h2>`+EX.stories.map((t,i)=>`<button class=opt data-a=hubopen data-k=st data-v=${i}><b>${esc(t.titleEnglish)}</b><div class=mu>${esc(t.titleIkwerre)}</div></button>`).join('')+`<h2>Proverbs</h2>`+EX.proverbs.map(p=>`<div class=card><b>${esc(p.ikwerre)}</b><div>${esc(p.english)}</div><div class=mu>${esc(p.meaning)}</div></div>`).join('')}

function face(m,z=72){const k='#3b2a1a',sw=`stroke="${k}" stroke-width="3.4" fill="none" stroke-linecap="round"`;
 const eyes=m==='cheer'?`<path d="M30 46q8-10 16 0M54 46q8-10 16 0" ${sw}/>`:`<circle cx="38" cy="46" r="7" fill="#fff"/><circle cx="62" cy="46" r="7" fill="#fff"/><circle cx="${m==='sad'?38:39.5}" cy="${m==='sad'?49:47}" r="3.4" fill="${k}"/><circle cx="${m==='sad'?62:63.5}" cy="${m==='sad'?49:47}" r="3.4" fill="${k}"/>`;
 const brow=m==='sad'?`<path d="M29 41l13-5M71 41l-13-5" ${sw}/>`:'';
 const mouth=m==='sad'?`<path d="M42 72q8-8 16 0" ${sw}/>`:m==='cheer'?`<path class="mo" d="M37 62q13 17 26 0z" fill="#7a2e1a"/>`:`<path class="mo" d="M40 64q10 10 20 0" ${sw}/>`;
 return`<svg class="mf" width="${z}" height="${z}" viewBox="0 0 100 100" role="img" aria-label="Mascot"><path d="M50 12c8 0 12 5 12 11 0 5-3 8-6 11 14 4 25 17 25 33 0 19-14 31-31 31S19 86 19 67c0-16 11-29 25-33-3-3-6-6-6-11 0-6 4-11 12-11z" fill="#D98A3D" stroke="#8a4b17" stroke-width="3"/><path d="M50 13c0-7 7-11 15-9-1 8-7 11-15 9z" fill="#4C9F5E"/><ellipse cx="29" cy="60" rx="6" ry="4" fill="#E58B7B" opacity=".6"/><ellipse cx="71" cy="60" rx="6" ry="4" fill="#E58B7B" opacity=".6"/>${eyes}${brow}${mouth}</svg>`}
const mas=(m,t,z=64)=>`<div class=mas>${face(m,z)}<div class=bub2>${t}</div></div>`;
function talk(){document.querySelectorAll('.mf').forEach(e=>{e.classList.add('sp');setTimeout(()=>e.classList.remove('sp'),1100)})}
function greet(){const n=Object.keys(S.done).length;return mas('happy',n?`Welcome back${S.name?', '+esc(S.name):''}!${S.streak?' '+S.streak+' day streak, keep it going.':' Ready for a few new words?'}`:'Welcome'+(S.name?', '+esc(S.name):'')+'! Tap the glowing star to learn your first words.',72)}
function studio(){return`<div class=lh><button class=x data-a=tab data-v=profile aria-label="Back">←</button><h2 style="margin:0">Voice studio</h2></div><p class=mu>Record each word in a quiet room, or import a clip. Your recording replaces the built-in computer voice. Audio stays on this device. ${Object.keys(AUD).length} of ${ALL.length} words have audio.</p><button class=btn data-a=edit>Edit course words</button>`+ALL.map(w=>`<div class=wrow><div><b>${w[0]}</b><div class=mu>${w[1]}</div><div class=mu><i>${pron(w[0])}</i></div></div><div class=row style="margin:0"><button class=ghost data-a=say data-v="${w[0]}" aria-label="Play ${w[0]}">${AUD[w[0]]?'🔊':'🔇'}</button><button class=ghost data-a=rec data-v="${w[0]}" aria-label="Record ${w[0]}">${recK===w[0]?'⏹':'🎙'}</button><label class=ghost style="cursor:pointer">⬆<input type=file accept="audio/*" hidden data-k="${w[0]}"></label></div></div>`).join('')}
function editor(){const t=loadCourse(COURSE);
 return`<div class=lh><button class=x data-a=tab data-v=studio aria-label="Back">←</button><h2 style="margin:0">Course words</h2></div><p class=mu>One unit per “#” line, then “ikwerre = english” on each line. Saving reloads the course.</p><textarea id=ct style="width:100%;height:50vh;padding:12px;border-radius:14px;border:2px solid var(--ln);background:var(--card);color:var(--tx);font:700 15px monospace">${t.replace(/</g,'&lt;')}</textarea><div class=row><button class=btn data-a=savec>Save</button></div><button class=ghost style="width:100%;margin-top:8px" data-a=resetc>Reset to starter words</button>`}
aload();
function toast(message) {
  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2200);
}

function burst() {
  const symbols = ['🎉', '✨', '🌿', '⭐'];

  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('span');
    piece.className = 'cf';
    piece.textContent = symbols[i % symbols.length];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2600);
  }
}

/* ===== lesson engine ===== */
let lessonTimer = null;

function isLessonPageActive() {
  return document.visibilityState === 'visible' && document.hasFocus();
}

function updateDailyGoalDisplay() {
  const minutes = Math.min(S.mt || 0, S.goal);
  const timeLabel = $('#todayMinutes');
  const remainingLabel = $('#todayGoalRemaining');
  const progressBar = $('#todayGoalProgress');
  if (timeLabel) timeLabel.textContent = `${minutes} of ${S.goal} min`;
  if (remainingLabel) {
    remainingLabel.textContent = `${Math.max(0, S.goal - (S.mt || 0))} more to fill the pot.`;
  }
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, ((S.mt || 0) / S.goal) * 100)}%`;
  }
}

function tickLessonClock() {
  if (!L || !L.clock) return;

  const now = performance.now();
  if (L.clock.wasActive) {
    const elapsed = Math.min(Math.max(0, now - L.clock.last), 5000);
    L.activeMs += elapsed;
    roll();
    S.mtMs = (S.mtMs || 0) + elapsed;
    S.mt = Math.floor(S.mtMs / 60_000);
  }
  L.clock.last = now;
  L.clock.wasActive = isLessonPageActive();

  if (now - L.clock.lastSaved >= 15_000) {
    L.clock.lastSaved = now;
    save();
  }
  updateDailyGoalDisplay();
}

function startLessonClock() {
  stopLessonClock();
  L.clock = {
    last: performance.now(),
    lastSaved: performance.now(),
    wasActive: isLessonPageActive(),
  };
  lessonTimer = setInterval(tickLessonClock, 1000);
  document.addEventListener('visibilitychange', tickLessonClock);
  window.addEventListener('focus', tickLessonClock);
  window.addEventListener('blur', tickLessonClock);
}

function stopLessonClock() {
  if (lessonTimer === null) return;
  tickLessonClock();
  clearInterval(lessonTimer);
  lessonTimer = null;
  document.removeEventListener('visibilitychange', tickLessonClock);
  window.removeEventListener('focus', tickLessonClock);
  window.removeEventListener('blur', tickLessonClock);
  if (L) L.clock = null;
  save();
}

function build(words, guide, reviewWords = []) {
  const experience = S.fam || 'I am starting fresh';
  const isBeginner = experience === 'I am starting fresh';
  const isIntermediate = experience === 'I know a little';
  const isProfessional = experience === 'I speak Ikwerre fluently';
  const introduction = guide ? [{ k: 'pattern', guide }] : [];
  const teaching = words
    .slice(
      0,
      isBeginner ? words.length : isIntermediate ? 1 : isProfessional ? 0 : 1
    )
    .map((word) => ({ k: 'teach', w: word }));
  const practice = words.flatMap((word) => {
    if (isProfessional) {
      return [
        { k: 'mc', w: word },
        { k: 'listen', w: word },
        { k: 'type', w: word },
      ];
    }
    if (isIntermediate) {
      return [
        { k: 'mc', w: word },
        { k: 'listen', w: word },
      ];
    }
    return [
      { k: 'mc', w: word },
      { k: 'listen', w: word },
    ];
  });
  const typingCount = isProfessional
    ? 2
    : isBeginner
      ? 2
      : isIntermediate
        ? 3
        : 0;
  const review = [
    { k: 'match', ws: words },
    ...words.slice(0, typingCount).map((word) => ({ k: 'type', w: word })),
    ...words
      .filter((word) => word[0].split(' ').length > 1)
      .slice(0, isProfessional ? 2 : 1)
      .map((word) => ({ k: 'order', w: word })),
    ...(isProfessional || isIntermediate
      ? [
          ...words.slice(0, isProfessional ? words.length : 1).map((word) => ({
            k: 'say',
            w: word,
          })),
        ]
      : words.slice(0, 2).map((word) => ({ k: 'say', w: word }))),
  ];

  const retrieval = reviewWords.map((word, index) => ({
    k: index % 2 === 0 ? 'mc' : 'listen',
    w: word,
    again: 1,
  }));
  return [
    ...introduction,
    ...teaching,
    ...sh([...practice, ...retrieval]),
    ...sh(review),
  ];
}

const RELATED_ANSWERS = [
  ['water', 'milk', 'rain', 'salt'],
  ['come', 'go', 'wait', 'take'],
  ['market', 'home', 'school', 'road'],
  ['home', 'school', 'kitchen', 'church'],
  ['day', 'night', 'morning', 'evening'],
  ['good morning', 'good afternoon', 'good evening', 'good night'],
  ['brother', 'sister', 'siblings', 'relations or relatives'],
  ['1', '2', '10', '11'],
];

function opts(word, side, avoidIndex = -1) {
  const answer = word[side];
  const unit = U.find((candidate) => candidate.w.includes(word));
  const result = createQuizOptions(
    word,
    side,
    ALL,
    unit ? unit.w : [],
    RELATED_ANSWERS,
    sh
  );
  const answerIndex = result.findIndex((option) => norm(option) === norm(answer));
  if (answerIndex === avoidIndex) {
    const alternatives = result.map((_, index) => index).filter((index) => index !== avoidIndex);
    const swapIndex = sh(alternatives)[0];
    [result[answerIndex], result[swapIndex]] = [result[swapIndex], result[answerIndex]];
  }
  return result;
}

function start(id, words, practiceMode) {
  stopLessonClock();
  roll();
  const lesson = id && LS.find((item) => item.id === id);
  const lessonIndex = lesson ? LS.indexOf(lesson) : -1;
  const reviewWords =
    lessonIndex >= 2
      ? selectReviewWords(LS, lessonIndex, S.done, sh, 2)
      : [];
  L = {
    id,
    p: practiceMode,
    q: build(
      words,
      lesson && lesson.guide && PATTERN_GUIDES[lesson.guide],
      reviewWords
    ),
    i: 0,
    right: 0,
    wrong: 0,
    sel: null,
    fb: null,
    sr: 0,
    lastShownAnswerIndex: -1,
    activeMs: 0,
    title: lesson ? `${U[lesson.u].t} · lesson ${lesson.n}` : 'Practice',
  };

  let lastAnswerIndex = -1;
  L.q.forEach((question) => {
    if (question.k === 'order') {
      question.tok = question.w[0].split(' ');
      question.bank = sh(question.tok.map((_, index) => index));
      question.pick = [];
    }

    if (question.k === 'listen' && !canSay(question.w[0])) {
      question.k = 'mc';
    }

    if (question.k === 'mc' || question.k === 'listen') {
      const side = question.k === 'mc' ? 1 : 0;
      question.o = opts(question.w, side, lastAnswerIndex);
      lastAnswerIndex = question.o.findIndex(
        (option) => norm(option) === norm(question.w[side])
      );
    }
  });

  startLessonClock();
  render();
  if (L.q[0] && L.q[0].k === 'teach') say(L.q[0].w[0]);
}

function ex() {
  const question = L.q[L.i];

  switch (question.k) {
    case 'pattern':
      return `${mas('happy', 'Look for a piece you have seen before.') }<h2>${esc(question.guide.title)}</h2><p>${esc(question.guide.intro)}</p><div class=pattern>${question.guide.rows
        .map(
          (row) =>
            `<div class=pattern-row><div class=parts>${row.parts
              .map((part) => `<b class=part>${esc(part)}</b>`)
              .join('<span class=mu>+</span>')}</div><b style="text-align:right">${esc(row.meaning)}</b></div>`
        )
        .join('')}<div class=pattern-note>${esc(question.guide.note)}</div></div>`;
    case 'teach':
      return `${mas('happy', 'Listen, then say it with me.')}<h2>New word</h2><div class=big>${question.w[0]}</div><div class=row><button class=spk data-a=say data-v="${question.w[0]}" aria-label="Play audio">🔊</button><button class="spk" style="background:var(--ac);box-shadow:0 4px 0 #c58d12" data-a=slow data-v="${question.w[0]}" aria-label="Play slowly">🐢</button></div><p style="text-align:center;margin:0 0 6px">Say it: <b>${pron(question.w[0])}</b></p><p class=mu style="text-align:center;font-size:20px">${question.w[1]}</p>`;
    case 'mc':
      return `<h2>What does “${question.w[0]}” mean?</h2><div class=row><button class=spk data-a=say data-v="${question.w[0]}" aria-label="Play audio">🔊</button></div>${question.o
        .map(
          (option) =>
            `<button class="opt ${L.sel === option ? 'sel' : ''}" data-a=pick data-v="${option}">${option}</button>`
        )
        .join('')}`;
    case 'listen':
      return `<h2>Tap what you hear</h2><div class=row><button class=spk data-a=say data-v="${question.w[0]}" aria-label="Play audio">🔊</button><button class=spk style="background:var(--ac);box-shadow:0 4px 0 #c58d12" data-a=slow data-v="${question.w[0]}" aria-label="Play slowly">🐢</button></div>${question.o
        .map(
          (option) =>
            `<button class="opt ${L.sel === option ? 'sel' : ''}" data-a=pick data-v="${option}">${option}</button>`
        )
        .join('')}`;
    case 'type':
      return `<h2>Type “${question.w[1]}” in ${LANGNAME}</h2><input class=ti id=ti autocomplete=off autocapitalize=none spellcheck=false placeholder="Your answer">`;
    case 'say':
      return `${mas('happy', 'Ready to speak? Say the whole word once, at your own pace.')}<h2>Listen, then say it</h2><div class=big>${question.w[0]}</div><p style="text-align:center;margin:0 0 6px">Say it: <b>${pron(question.w[0])}</b></p><div class=row><button class=spk data-a=say data-v="${question.w[0]}" aria-label="Hear">🔊</button><button class=spk style="background:var(--ac);box-shadow:0 4px 0 #c58d12" data-a=slow data-v="${question.w[0]}" aria-label="Slower">🐢</button></div><p class=mu style="text-align:center">${question.w[1]}</p>`;
    case 'order':
      return `<h2>Put \u201c${question.w[1]}\u201d into Ikwerre order</h2><div class=mas>${face('happy', 56)}<div class=bub2 style="flex:1;min-height:48px">${question.pick.length
        ? question.pick
            .map((index) => `<button class=ghost data-a=tile data-v=${index}>${question.tok[index]}</button>`)
            .join(' ')
        : '<span class=mu>Choose words below</span>'}</div></div><div class=row style="flex-wrap:wrap">${question.bank
        .filter((index) => !question.pick.includes(index))
        .map(
          (index) =>
            `<button class=opt style="width:auto;margin:4px" data-a=tile data-v=${index}>${question.tok[index]}</button>`
        )
        .join('')}</div>`;
    case 'match': {
      if (!question.m) {
        question.m = {
          l: sh(question.ws.map((word) => word[0])),
          r: sh(question.ws.map((word) => word[1])),
          s: null,
          d: [],
          b: '',
        };
      }

      const match = question.m;
      const choice = (value, side) =>
        `<button class="opt ${match.d.includes(value) ? 'dn' : ''} ${match.s && match.s.v === value ? 'sel' : ''} ${match.b === value ? 'bd' : ''}" data-a=mt data-side=${side} data-v="${value}">${value}</button>`;

      return `<h2>Tap the matching pairs</h2><div class=mt><div>${match.l
        .map((value) => choice(value, 'l'))
        .join('')}</div><div>${match.r
        .map((value) => choice(value, 'r'))
        .join('')}</div></div>`;
    }
  }
}
function foot() {
  const question = L.q[L.i];

  if (L.fb) {
    const feedbackClass = L.fb.ok ? 'ok' : 'no';
    const feedbackText = L.fb.ok
      ? L.fb.msg || ''
      : `Correct answer: ${L.fb.msg}`;
    const heading = L.fb.ok
      ? ['Nice!', 'Correct!', 'Great job!'][L.i % 3]
      : 'Not quite';

    return `<div class="fb ${feedbackClass}"><div style="float:right">${face(L.fb.ok ? 'cheer' : 'sad', 48)}</div><b>${heading}</b><p>${feedbackText}</p><button class=btn data-a=next>Continue</button></div>`;
  }

  if (question.k === 'match') return '';

  const disabled =
    ((question.k === 'mc' || question.k === 'listen') && L.sel == null) ||
    question.k === 'type' ||
    (question.k === 'order' && question.pick.length < question.tok.length);
  const buttonText =
    question.k === 'teach'
      ? 'Continue'
      : question.k === 'pattern'
        ? 'Let’s practise'
        : question.k === 'say'
          ? 'I said it once'
          : 'Check my answer';
  const skipSpeech =
    question.k === 'say'
      ? '<button class=ghost style="width:100%;margin-top:8px;border:0" data-a=check>Can\u2019t speak now</button>'
      : '';

  return `<div class=ft><button class=btn data-a=check ${disabled ? 'disabled' : ''}>${buttonText}</button>${skipSpeech}</div>`;
}

function grade(correct, message, question) {
  L.fb = { ok: correct, msg: message, ua: L.ua, q: question };
  const word = question.w;

  if (correct) {
    L.right++;
    L.sr++;
    sOk();
    if (L.p && word) {
      S.miss = S.miss.filter((item) => item[0] !== word[0]);
    }
  } else {
    L.wrong++;
    L.sr = 0;
    sNo();

    if (question.k !== 'match') {
      L.q.push({
        ...question,
        again: 1,
        pick: question.pick && [],
        o: question.o && sh(question.o),
      });
    }

    if (word && !S.miss.some((item) => item[0] === word[0])) {
      S.miss.push(word);
    }
    S.miss = S.miss.slice(-30);
  }

  save();
  render();
}

function check() {
  const question = L.q[L.i];

  if (question.k === 'teach' || question.k === 'say' || question.k === 'pattern') {
    L.i++;
    L.sel = null;
    return render();
  }

  if (question.k === 'order') {
    const answer = question.pick.map((index) => question.tok[index]).join(' ');
    L.ua = answer;
    return grade(norm(answer) === norm(question.w[0]), question.w[0], question);
  }

  if (question.k === 'mc' || question.k === 'listen') {
    const answer = question.k === 'mc' ? question.w[1] : question.w[0];
    L.ua = L.sel;
    return grade(L.sel === answer, answer, question);
  }

  if (question.k === 'type') {
    const answer = $('#ti').value.trim();
    const target = question.w[0];
    L.ua = answer;
    const accentNote =
      norm(answer) === norm(target) && answer.toLowerCase() !== target.toLowerCase()
        ? '  (mind the accents)'
        : '';
    return grade(norm(answer) === norm(target), target + accentNote, question);
  }
}

function mtap(element) {
  const question = L.q[L.i];
  const match = question.m;
  const value = element.dataset.v;
  const side = element.dataset.side;

  if (!match.s || match.s.side === side) {
    match.s = { v: value, side };
    match.b = '';
    return render();
  }

  const left = side === 'l' ? value : match.s.v;
  const right = side === 'r' ? value : match.s.v;
  const correct = question.ws.some((word) => word[0] === left && word[1] === right);

  if (correct) {
    match.d.push(left, right);
    match.s = null;
    match.b = '';
    sOk();

    if (match.d.length === question.ws.length * 2) {
      return grade(true, 'All matched', question);
    }
  } else {
    L.wrong++;
    sNo();
    match.b = value;
    match.s = null;

    question.ws.forEach((word) => {
      const partOfWrongPair = word[0] === left || word[1] === right;
      const alreadyMissed = S.miss.some((item) => item[0] === word[0]);
      if (partOfWrongPair && !alreadyMissed) S.miss.push(word);
    });

    save();
  }

  render();
}
function fin() {
  if (!L.rew) {
    stopLessonClock();
    L.rew = 1;
    const cowries = L.p ? 2 : 5 + (L.wrong === 0 ? 2 : 0);

    L.xp = 25;
    L.cw = cowries;
    L.timeLabel =
      L.activeMs < 60_000
        ? `${Math.max(1, Math.round(L.activeMs / 1000))} sec`
        : `${Math.round(L.activeMs / 60_000)} min`;
    S.xp += 25;
    S.xpToday += 25;
    S.cow = (S.cow || 0) + cowries;
    S.lt++;
    if (!L.wrong) S.pt++;

    const currentDay = today();
    if (S.last !== currentDay) {
      const yesterday = dstr(new Date(Date.now() - 864e5));
      S.streak = S.last === yesterday ? S.streak + 1 : 1;
      S.last = currentDay;
    }
    S.days = [...new Set([...S.days, currentDay])].slice(-60);

    if (L.id) {
      S.done[L.id] = Math.min(5, (S.done[L.id] || 0) + 1);
    }
    save();
    sOk();
    burst();
  }

  const nextLesson = LS.findIndex((lesson) => !S.done[lesson.id]);
  return `<div style="text-align:center;padding-top:16px">${face('cheer',100)}<div style="font-weight:800;color:var(--ok)">\u2713 LEARNING STEP COMPLETE</div><h1 style="margin:4px 0 12px">${L.title}</h1><div class=card style="border-color:var(--ac);text-align:left"><div class=mu style="font-size:12px;text-transform:uppercase">Your reward</div><b style="font-size:22px">+${L.cw} cowries</b><div class=mu>${S.cow} cowries in your pouch</div></div><div class=card style="text-align:left"><div class=mu style="font-size:12px;text-transform:uppercase">\u1ecck\u1ee5 \u00b7 your streak</div><b>${S.streak>1?'Day '+S.streak+'. Keep it burning.':'Day 1. Your streak begins.'}</b><div class=mu>Today counts. Learn tomorrow to make it ${S.streak+1}.</div></div><div class=stats><div class=card><b>+${L.xp}</b><span class=mu>XP earned</span></div><div class=card><b>${L.right} of ${L.right+L.wrong}</b><span class=mu>answers right</span></div><div class=card><b>${L.timeLabel}</b><span class=mu>time</span></div></div></div><div class=ft>${nextLesson>=0?'<button class=btn data-a=node data-v='+nextLesson+'>Next lesson</button>':''}<button class=ghost style="width:100%;margin-top:8px" data-a=again>Practise again</button><button class=ghost style="width:100%;margin-top:6px;border:0" data-a=home>Back to home</button></div>`;
}

function fbv() {
  const feedback = L.fb;
  const question = feedback.q;
  const word = question.w;
  const correctAnswer = word ? (question.k === 'mc' ? word[1] : word[0]) : '';
  const heading = feedback.ok
    ? question.again
      ? 'Great comeback!'
      : ['Excellent listening!', 'Nice work!', 'Well done!'][L.i % 3]
    : 'Good try. Take another look.';

  return `<div style="text-align:center;padding-top:28px">${face(feedback.ok?'cheer':'sad',100)}<div style="font-weight:800;color:${feedback.ok?'var(--ok)':'var(--ac)'};text-transform:uppercase">${feedback.ok?'Correct!':'Keep going'}</div><h1 style="margin:6px 0 14px">${heading}</h1>${feedback.ok?`<div class=card style="background:var(--okbg)"><b style="font-size:20px">${word?esc(word[0]):'All matched'}</b> <span class=mu>That\u2019s good!</span></div>${L.sr>=2?`<p style="color:var(--no);font-weight:800">${L.sr} in a row! You\u2019re on fire!</p>`:''}`:`<div class=card><div class=mu style="font-size:12px;text-transform:uppercase">You answered</div><s class=mu style="font-size:18px">${esc(feedback.ua||'\u2014')}</s></div><div class=card style="border-color:var(--ac)"><div class=mu style="font-size:12px;text-transform:uppercase">Best answer</div><b style="font-size:22px">${esc(correctAnswer)}</b></div>`}${word?`<p>\u201c${esc(word[0])}\u201d <button class=ghost data-a=say data-v="${esc(word[0])}" aria-label="Hear">🔊</button> means \u201c${esc(word[1])}\u201d.</p>`:''}</div><div class=ft><button class=btn data-a=next>Continue</button></div>`;
}
function lessonView(){
  if (!L.q[L.i]) return fin();
  if (L.fb) return fbv();

  const progress = Math.round((L.i / L.q.length) * 100);
  const question = L.q[L.i];
  const stage =
    question.k === 'teach'
      ? 'Learn'
      : question.k === 'pattern'
        ? 'Discover'
        : 'Practise';

  return `<div class=lh><button class=x data-a=quit aria-label="Quit lesson">✕</button><div class=bar><i style="width:${progress}%"></i></div><span class=hp>${L.sr>=2?'🔥 '+L.sr+' in a row':''}</span></div><div class=ex><div class=mu style="font-size:12px;text-transform:uppercase;font-weight:800;margin-bottom:6px">${L.title} \u00b7 ${stage} \u00b7 step ${L.i+1} of ${L.q.length}</div>${ex()}</div>${foot()}`;}
/* ===== tabs ===== */
const topbar = () => {
  const firstIncomplete = LS.findIndex((lesson) => !S.done[lesson.id]);
  const currentUnit = firstIncomplete < 0 ? U.length - 1 : LS[firstIncomplete].u;
  const shortWords = U[currentUnit].w.filter(
    (word) => word[0].length <= 14 && word[1].length <= 30
  );
  const dailyWords = shortWords.length ? shortWords : U[currentUnit].w;
  const word = dailyWords[Math.floor(Date.now() / 864e5) % dailyWords.length];

  return `<div class="top dark"><span style="text-align:left;line-height:1.25;cursor:default"><small style="font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:#f2d18a">Today’s word</small><br><b>${word[0]}</b> <button data-a=say data-v="${word[0]}" aria-label="Play" style="background:#e29b3b;border:0;border-radius:50%;width:26px;height:26px">🔊</button></span><span class=pr><span data-a=tab data-v=quests>🐚 ${S.cow||0}</span><span data-a=tab data-v=profile>${face('happy',22)} Me</span></span></div>`;
};
let openU=null,allU=false;
function learn() {
  let currentLesson = LS.findIndex((lesson) => !S.done[lesson.id]);
  if (currentLesson < 0) currentLesson = LS.length;

  const currentUnit =
    currentLesson < LS.length ? LS[currentLesson].u : U.length - 1;
  const openUnit = openU == null ? currentUnit : openU;
  let html = topbar() + greet() + `<div class=card style="display:flex;gap:14px;align-items:center"><div style="font-size:44px">🏺</div><div style="flex:1"><div class=mu style="font-size:12px;text-transform:uppercase;font-weight:800">Today’s goal</div><b id=todayMinutes style="font-size:22px">${Math.min(S.mt||0,S.goal)} of ${S.goal} min</b><div id=todayGoalRemaining class=mu>${Math.max(0,S.goal-(S.mt||0))} more to fill the pot.</div><div class=prog><i id=todayGoalProgress style="width:${Math.min(100,(S.mt||0)/S.goal*100)}%"></i></div></div><span style="border:2px solid var(--ln);border-radius:999px;padding:4px 10px;font-size:13px;white-space:nowrap">🔥 ${S.streak}</span></div><div class=note>Words come from the book Let Us Speak Ikwerre. Spellings follow the book and may hold typos, so check them with a speaker. Fix words and record audio under Profile, then Voice studio.</div>`;

  if (currentLesson < LS.length) {
    const lesson = LS[currentLesson];
    html += `<div class=card><div class=mu style="font-size:12px;text-transform:uppercase;color:var(--pr)">Next lesson · ${lesson.w.length} useful words</div><b style="font-size:20px">${U[lesson.u].t} · lesson ${lesson.n}</b>${lesson.guide?`<p class=mu>${esc(PATTERN_GUIDES[lesson.guide].title)}</p>`:''}<p class=mu>${lesson.w.slice(0,3).map((word)=>word[0]).join(', ')}${lesson.w.length>3?' and more':''}</p><button class=btn data-a=node data-v=${currentLesson}>Continue lesson</button></div>`;
  }

  if (S.miss.length) {
    html += `<div class=card><div class=mu style="font-size:12px;text-transform:uppercase;color:var(--pr)">Ripe for review</div><b style="font-size:20px">${S.miss.length} word${S.miss.length>1?'s':''} to revisit</b><p class=mu>${S.miss.slice(-3).map((word)=>word[0]).join(' · ')}</p><button class=btn style="background:var(--ok);box-shadow:0 4px 0 #1d8a56" data-a=pmiss>Review them</button></div>`;
  }

  const visibleUnits = U.map((_, index) => index).filter(
    (index) =>
      allU ||
      index === currentUnit ||
      (index > currentUnit && index <= currentUnit + 2)
  );

  if (!allU && currentUnit > 0) {
    html += `<button class=ghost style="width:100%;margin:12px 0 0" data-a=uall>✓ ${currentUnit} completed unit${currentUnit>1?'s':''} · show</button>`;
  }

  visibleUnits.forEach((unitIndex) => {
    const unit = U[unitIndex];
    const lessons = LS.filter((lesson) => lesson.u === unitIndex);
    const completed = lessons.filter((lesson) => S.done[lesson.id]).length;
    const locked = unitIndex > currentUnit;
    const isOpen = unitIndex === openUnit && !locked;

    html += `<button class="unit ${locked?'lk':''}" data-a=utog data-v=${unitIndex}><b>Unit ${unitIndex+1} · ${completed} of ${lessons.length} lessons${locked?' · locked':''}</b><span>${unit.t}</span><i>${locked?'🔒':isOpen?'▲':'▼'}</i></button>`;
    if (!isOpen) return;

    html += '<div class=path>';
    lessons.forEach((lesson) => {
      const lessonIndex = LS.indexOf(lesson);
      const status = S.done[lesson.id]
        ? 'done'
        : lessonIndex === currentLesson
          ? 'cur'
          : 'lock';
      const offset = [0, 38, 56, 38, 0, -38, -56, -38][lessonIndex % 8];
      const lessonLabel =
        status === 'done'
          ? 'completed'
          : status === 'cur'
            ? 'current'
            : 'locked';
      const icon = status === 'done' ? '✓' : status === 'lock' ? '🔒' : '★';
      const startLabel = status === 'cur' ? '<div class=bub>Start</div>' : '';
      const level =
        status === 'done'
          ? `<div class=lv>${'●'.repeat(S.done[lesson.id])}</div>`
          : '';

      html += `<div class=nw style="transform:translateX(${offset}px)">${startLabel}<button class="node ${status}" data-a=node data-v="${lessonIndex}" aria-label="Lesson ${lesson.n}, ${lessonLabel}">${icon}</button>${level}</div>`;
    });
    html += '</div>';
  });

  return html + `<button class=ghost style="width:100%;margin:14px 0" data-a=uall>${allU?'Show fewer units ▲':'See all '+U.length+' units ▼'}</button>`;
}

function learned() {
  const learnedWords = LS.filter((lesson) => S.done[lesson.id]).flatMap(
    (lesson) => lesson.w
  );
  return [
    ...new Map(
      learnedWords.map((word) => [norm(word[0]), word])
    ).values(),
  ];
}

function practice() {
  const learnedWords = learned();
  let html = topbar() + `<h2>Practice</h2>`;
  html += `<div class=card><b>Review mistakes</b><p class=mu>${S.miss.length?S.miss.length+' words to revisit':'Nothing to review yet.'}</p><button class=btn data-a=pmiss ${S.miss.length?'':'disabled'}>Start review</button></div>`;
  html += `<div class=card><b>Alphabet and sounds</b><p class=mu style="font-size:14px">a = ah (father) · e = eh (bed) · i = ee (see) · ị = ih (bit) · o = oh (go) · ọ = aw (law) · u = oo (food) · ụ = u (put). A doubled vowel is held longer. gb and kp: say both sounds at once. gh: a soft throaty g. nw: ng then w. ṅ = ng in sing. wh = hw. ny as in canyon. Say every syllable evenly; tone changes pitch, so listen to a speaker. Audio plays your recording first, then your phone’s voice reading the sound guide (smoother). Both are only rough guides. Record a speaker in Voice studio to replace it.</p></div><div class=card><b>Mixed practice</b><p class=mu>${learnedWords.length?'Random words from lessons you have completed.':'Finish your first lesson to unlock this.'}</p><button class=btn data-a=pmix ${learnedWords.length?'':'disabled'}>Start practice</button></div><h2>Word bank</h2>`;

  html += learnedWords.length
    ? learnedWords
        .map(
          (word) =>
            `<div class=wrow><div><b>${word[0]}</b><div class=mu>${word[1]}</div><div class=mu><i>${pron(word[0])}</i></div></div><button class=ghost data-a=say data-v="${word[0]}" aria-label="Play ${word[0]}">🔊</button></div>`
        )
        .join('')
    : '<p class=mu>Words you learn will appear here with audio.</p>';

  return html;
}

function quests() {
  const dailyQuests = [
    ['Earn 20 XP today', S.xpToday, 20],
    ['Finish 2 lessons today', S.lt, 2],
    ['Get a perfect lesson', S.pt, 1],
  ];

  return (
    topbar() +
    `<h2>Daily quests</h2>` +
    dailyQuests
      .map(
        (quest) =>
          `<div class=card><b>${quest[0]}</b> <span class=mu style="float:right">${Math.min(quest[1],quest[2])}/${quest[2]} ${quest[1]>=quest[2]?'✅':''}</span><div class=prog><i style="width:${Math.min(100,quest[1]/quest[2]*100)}%"></i></div></div>`
      )
      .join('')
  );
}

const EXPERIENCE_OPTIONS = [
  'I am starting fresh',
  'I know a little',
  'I speak Ikwerre fluently',
];
const REMINDER_TIMES = ['7:00 AM', '12:00 PM', '6:00 PM', '7:00 PM', '9:00 PM'];

function profile() {
  const week = [...Array(7)]
    .map((_, index) => {
      const date = new Date(Date.now() - (6 - index) * 864e5);
      return `<div>${date.toLocaleDateString('en',{weekday:'narrow'})}<i>${S.days.includes(dstr(date))?'🔥':'·'}</i></div>`;
    })
    .join('');
  const membership = !accountUser
    ? `<div class=card><b>Save your progress</b><p class=mu>Create an account to sync your learning between devices.</p><button class=btn data-a=account>Create account</button></div>`
    : accountUser.isPremium
      ? `<div class=card><b>Premium is active</b><p class=mu>${accountUser.subscriptionStatus==='non_renewing'?'Your subscription will not renew. Premium is available until '+esc(accountUser.premiumUntil||'the end of your billing period'):'Ad-free learning · ₦3,000/month'}</p>${accountUser.subscriptionStatus==='active'?'<button class=ghost data-a=premium-cancel>Cancel renewal</button>':''}</div>`
      : `<div class=card><b>Premium · ₦3,000/month</b><p class=mu>Enjoy Ikwerre Path without ads. Your subscription renews monthly and can be cancelled anytime.</p><button class=btn data-a=premium-start>Go Premium</button></div>`;
  const emailReminderSetting = accountUser
    ? `<div class=card><label class=checkline><input id=emailReminders type=checkbox ${accountUser.emailRemindersEnabled ? 'checked' : ''}>Email me a weekly learning reminder if I have signed in fewer than three times this week.</label><p class=mu>Only sent if you opt in, and you can turn it off here or use the unsubscribe link in any email.</p></div>`
    : '';
  const passwordSetting = accountUser && accountUser.canChangePassword
    ? `<div class=card><b>Change password</b><form id=passwordChangeForm class=auth-fields><label for=currentPassword>Current password<input id=currentPassword name=currentPassword type=password autocomplete=current-password minlength=8 maxlength=128 required></label><label for=newPassword>New password<input id=newPassword name=newPassword type=password autocomplete=new-password minlength=8 maxlength=128 required></label><label for=newPasswordConfirm>Confirm new password<input id=newPasswordConfirm name=newPasswordConfirm type=password autocomplete=new-password minlength=8 maxlength=128 required></label><button type=submit class=btn ${authBusy?'disabled':''}>${authBusy?'Please wait…':'Update password'}</button></form></div>`
    : '';
  const adminButton = accountUser && accountUser.isAdmin
    ? '<div class=card><b>Owner tools</b><p class=mu>View account, activity, Premium, and reminder totals.</p><button class=btn data-a=admin>Open admin dashboard</button></div>'
    : '';

  return topbar()+`<h2>Profile</h2>${accountUser?`<div class=card><b>${esc(accountUser.name)}</b><div class=mu>${esc(accountUser.email)}</div><button class=ghost data-a=signout>Sign out</button></div>`:''}<div class=stats><div class=card><b>${S.streak}</b><span class=mu>Day streak</span></div><div class=card><b>${S.xp}</b><span class=mu>Total XP</span></div><div class=card><b>${learned().length}</b><span class=mu>Words</span></div></div>${membership}${passwordSetting}${emailReminderSetting}${adminButton}<div class=card><b>This week</b><div class=wk style="margin-top:10px">${week}</div></div>
 <div class=card><b>Your learning profile</b><div class=wrow><label for=profileName>Your name</label><input id=profileName class=ghost value="${esc(S.name||'')}" placeholder="Your name" autocomplete=off></div><div class=wrow><label for=level>Starting level</label><select id=level class=ghost>${EXPERIENCE_OPTIONS.map(level=>`<option value="${level}" ${S.fam===level?'selected':''}>${level}</option>`).join('')}</select></div></div>
 <div class=card><b>Settings</b><div class=wrow><span>Daily goal</span><select id=goal class=ghost>${[10,20,30,45].map(goal=>`<option value=${goal} ${S.goal===goal?'selected':''}>${goal} min</option>`).join('')}</select></div><div class=wrow><label for=rt>Daily reminder</label><select id=rt class=ghost>${REMINDER_TIMES.map(time=>`<option ${((S.rt||'7:00 PM')===time)?'selected':''}>${time}</option>`).join('')}</select></div><div class=wrow><span>Reminder status</span><button class=ghost data-a=reminders>${S.reminders?'On':'Off'}</button></div><div class=mu style="font-size:12px">Daily browser notifications work while this app stays open. Enable weekly email reminders above to receive them after closing.</div><div class=wrow><span>Use my phone’s voice (more natural)</span><button class=ghost data-a=apx>${S.apx===0?'Off':'On'}</button></div><div class=wrow><span>Voice studio and course words</span><button class=ghost data-a=tab data-v=studio>Open</button></div><div class=wrow><span>Sound effects</span><button class=ghost data-a=snd>${S.snd?'On':'Off'}</button></div><div class=wrow><span>Reset all progress</span><button class=ghost data-a=reset style="color:var(--no)">Reset</button></div></div>`;
}

function adminScreen() {
  if (!adminLoading && !adminSummaryData) {
    return topbar() + `<button class=ghost data-a=tab data-v=profile>Back to profile</button><h2>Owner admin</h2><p class=auth-error>${esc(adminError || 'The dashboard could not be loaded.')}</p>`;
  }
  if (adminLoading) {
    return topbar() + '<button class=ghost data-a=tab data-v=profile>Back to profile</button><h2>Owner admin</h2><p class=mu>Loading dashboard…</p>';
  }

  const summary = adminSummaryData.summary;
  const users = adminSummaryData.recentUsers;
  return topbar() + `<button class=ghost data-a=tab data-v=profile>Back to profile</button><h2>Owner admin</h2><div class=stats><div class=card><b>${summary.totalUsers}</b><span class=mu>Total accounts</span></div><div class=card><b>${summary.activeUsersLast7Days}</b><span class=mu>Signed in this week</span></div><div class=card><b>${summary.premiumUsers}</b><span class=mu>Premium accounts</span></div><div class=card><b>${summary.reminderSubscribers}</b><span class=mu>Reminder subscribers</span></div></div><div class=card><b>Recent accounts</b>${users.length ? `<div class=admin-users>${users.map((user) => `<div class=admin-user><b>${esc(user.name)}</b><span>${esc(user.email)}</span><small class=mu>Joined ${esc(new Date(user.created_at).toLocaleDateString())} · Last sign-in ${user.last_login_at ? esc(new Date(user.last_login_at).toLocaleDateString()) : 'Never'}</small></div>`).join('')}</div>` : '<p class=mu>No accounts yet.</p>'}</div><p class=mu>This owner-only dashboard is read-only. Staff access is not enabled.</p>`;
}
let fam = S.fam || '';
function onboard() {
  const progressBar = `<div class=lh><div class=bar><i style="width:${step*100/7}%"></i></div><span class=mu>${step} / 7</span></div>`;
  const footer = (label, disabled) =>
    `<div class=ft><button class=btn data-a=ob ${disabled?'disabled':''}>${label}</button></div>`;

  if (step === 0) {
    return `<div style="text-align:center;padding-top:50px">${face('happy',120)}<h1>Speak Ikwerre with confidence</h1><p class=mu>Five minutes a day, hearing real voices.</p></div>${footer('Get started')}`;
  }

  if (step === 1) {
    const reasons = [
      'Connect with family',
      'Heritage and identity',
      'Travel or work',
      'Just curious',
    ];
    const choices = reasons
      .map(
        (reason) =>
          `<button class="opt ${why===reason?'sel':''}" data-a=why data-v="${reason}">${reason}</button>`
      )
      .join('');
    return (
      progressBar +
      mas('happy', 'Tell me why you are learning.') +
      `<h2>Why are you learning?</h2>${choices}${footer('Continue', !why)}`
    );
  }

  if (step === 2) {
    return (
      progressBar +
      mas('happy', 'What is your name?') +
      `<h2>What should I call you?</h2><p class=mu>I will use your name in lessons.</p><input class=ti id=nm value="${esc(S.name||'')}" placeholder="Your name" autocomplete=off>` +
      footer('Nice to meet you')
    );
  }

  if (step === 3) {
    const familiarity = [
      [EXPERIENCE_OPTIONS[0], 'Beginner · Learn each word with step-by-step support'],
      [EXPERIENCE_OPTIONS[1], 'Intermediate · Spend less time on familiar words and practise recall'],
      [EXPERIENCE_OPTIONS[2], 'Fluent or professional · Challenge yourself with translation and recall'],
    ];
    const choices = familiarity
      .map(
        ([label, description]) =>
          `<button class="opt ${fam===label?'sel':''}" data-a=fam data-v="${label}"><b>${label}</b><div class=mu>${description}</div></button>`
      )
      .join('');
    return (
      progressBar +
      mas('happy', 'Be honest, there is no wrong answer.') +
      `<h2>Which best describes your Ikwerre?</h2>${choices}${footer('Continue', !fam)}`
    );
  }

  if (step === 4) {
    const goals = [
      ['10 minutes', 'One lesson a day', 10],
      ['20 minutes', 'Two lessons a day', 20],
      ['30 minutes', 'Steady', 30],
      ['45 minutes', 'Ambitious', 45],
    ];
    const choices = goals
      .map(
        ([label, description, minutes]) =>
          `<button class="opt ${S.goal===minutes?'sel':''}" data-a=goal data-v="${minutes}"><b>${label}</b><div class=mu>${description}</div></button>`
      )
      .join('');
    return (
      progressBar +
      mas('happy', 'Little by little.') +
      `<h2>How much time feels realistic?</h2>${choices}${footer('Continue')}`
    );
  }

  if (step === 5) {
    const options = REMINDER_TIMES
      .map(
        (time) =>
          `<option ${(S.rt||'7:00 PM')===time?'selected':''}>${time}</option>`
      )
      .join('');
    return (
      progressBar +
      mas('happy', 'Do not forget me!') +
      `<h2>When should I remind you?</h2><p class=mu>Choose a time for one daily reminder. Your browser will ask permission before it is enabled.</p><select id=rt class=ghost style="width:100%;margin:8px 0">${options}</select><div class=card><b>For now: while the app is open</b><p class=mu>This browser reminder needs permission and works while this app stays open. Reminders after closing will need online setup later.</p></div><div class=ft><button class=btn data-a=reminder-enable>Allow notifications</button><button class=ghost style="width:100%;margin-top:8px;border:0" data-a=reminder-skip>Not now</button></div>`
    );
  }

  if (step === 6) {
    const levelDescriptions = {
      [EXPERIENCE_OPTIONS[0]]:
        'Each lesson introduces every word, then gives you guided meaning, listening, and speaking practice.',
      [EXPERIENCE_OPTIONS[1]]:
        'Lessons give a short refresher, then move sooner into recall, listening, and typing practice.',
      [EXPERIENCE_OPTIONS[2]]:
        'Lessons skip basic word introductions and emphasize translation, listening, and speaking practice with the verified course vocabulary.',
    };
    const learningReasons = {
      'Connect with family': 'Use everyday words to build confidence in family conversations.',
      'Heritage and identity': 'Strengthen your connection to Ikwerre through useful words and patterns.',
      'Travel or work': 'Build a practical base of words and phrases for everyday situations.',
      'Just curious': 'Explore useful words first, then notice how familiar parts connect.',
    };
    const level = S.fam || EXPERIENCE_OPTIONS[0];
    const reason = S.why || 'Just curious';

    return (
      progressBar +
      mas('happy', `A plan that fits you${S.name ? `, ${esc(S.name)}` : ''}.`) +
      `<h2>Your learning plan${S.name ? `, ${esc(S.name)}` : ''}</h2><div class=card><div class=mu style="font-size:12px;text-transform:uppercase">Starting level</div><b>${level}</b><p class=mu>${levelDescriptions[level] || levelDescriptions[EXPERIENCE_OPTIONS[0]]}</p></div><div class=card><div class=mu style="font-size:12px;text-transform:uppercase">Your goal</div><b>${reason}</b><p class=mu>${learningReasons[reason] || learningReasons['Just curious']}</p></div><p class=mu>You can change your starting level or name anytime in Profile. We will use the same verified Ikwerre words for every level.</p>` +
      footer('Continue')
    );
  }

  const firstWord = LS[0].w[0];
  return (
    progressBar +
    mas('happy', `Nice to meet you${S.name ? `, ${esc(S.name)}` : ''}.`) +
    `<h2>Your first word${S.name?', '+esc(S.name):''}.</h2><p class=mu>Listen once, then try it at your own pace.</p><div class=card style="border-color:var(--ac)"><b style="font-size:28px">${firstWord[0]}</b><div class=mu><i>${pron(firstWord[0])}</i></div><div class=mu>${firstWord[1]}</div><div class=row style="justify-content:flex-start"><button class=spk data-a=say data-v="${firstWord[0]}" aria-label="Hear">🔊</button></div></div><div class=ft><button class=btn data-a=ob>I said it once</button><button class=ghost style="width:100%;margin-top:8px;border:0" data-a=ob>Can\u2019t speak now</button></div>`
  );
}

function authScreen() {
  const isSignUp = authMode === 'signup';
  const pageHeader = `<main class=auth-page>
    <header class=auth-brand>
      <div class=auth-mark aria-hidden=true>🌿</div>
      <div class=mu style="font-size:12px;letter-spacing:1.2px;font-weight:800">IKWERRE PATH</div>
      <h1>Speak Ikwerre with confidence</h1>
      <p class=mu>Useful words, clear patterns, and steady progress.</p>
    </header>
  `;

  if (authMode === 'verify') {
    return `${pageHeader}<section class=auth-card><h2>Verify your email</h2><p class=mu>${esc(authMessage || 'Check your email for a verification link before signing in.')}</p>${authEmail ? `<p><b>${esc(authEmail)}</b></p>` : '<div class=auth-fields><label for=authEmail>Email address<input id=authEmail name=email type=email autocomplete=email maxlength=254 value="" placeholder="you@example.com"></label></div>'}<div class=auth-fields><button type=button class=btn data-a=resend-verification ${authBusy?'disabled':''}>${authBusy?'Please wait…':'Resend verification email'}</button><button type=button class=ghost data-a=authmode data-v=signin>Back to sign in</button></div></section></main>`;
  }

  if (authMode === 'forgot') {
    return `${pageHeader}<section class=auth-card><h2>Reset your password</h2><p class=mu>Enter your account email and we will send a password reset link if a password account exists.</p><form id=authForm class=auth-fields><label for=authEmail>Email address<input id=authEmail name=email type=email autocomplete=email maxlength=254 required value="${esc(authEmail)}" placeholder="you@example.com"></label>${authMessage ? `<p class=${authMessageType==='success'?'auth-success':'auth-error'} role=${authMessageType==='success'?'status':'alert'} aria-live=polite>${esc(authMessage)}</p>` : ''}<button type=submit class=btn ${authBusy?'disabled':''}>${authBusy?'Please wait…':'Send reset link'}</button><button type=button class=ghost data-a=authmode data-v=signin>Back to sign in</button></form></section></main>`;
  }

  if (authMode === 'reset') {
    return `${pageHeader}<section class=auth-card><h2>Choose a new password</h2><p class=mu>${passwordResetToken ? 'Use at least 8 characters. Your reset link can only be used once.' : 'This password reset link is invalid or missing. Request a new one from the sign-in page.'}</p>${passwordResetToken ? `<form id=authForm class=auth-fields><label for=authPassword>New password<input id=authPassword name=password type=password autocomplete=new-password minlength=8 maxlength=128 required></label><label for=authPasswordConfirm>Confirm new password<input id=authPasswordConfirm name=passwordConfirm type=password autocomplete=new-password minlength=8 maxlength=128 required></label>${authMessage ? `<p class=${authMessageType==='success'?'auth-success':'auth-error'} role=${authMessageType==='success'?'status':'alert'} aria-live=polite>${esc(authMessage)}</p>` : ''}<button type=submit class=btn ${authBusy?'disabled':''}>${authBusy?'Please wait…':'Reset password'}</button></form>` : ''}<button type=button class=ghost data-a=authmode data-v=signin>Back to sign in</button></section></main>`;
  }

  const accountAction = isSignUp ? 'Create account' : 'Sign in';
  return `${pageHeader}
    <section class=auth-card aria-labelledby=authTitle>
      <div class=auth-switch role=tablist aria-label="Account options">
        <button type=button role=tab aria-selected="${!isSignUp}" data-a=authmode data-v=signin>Sign in</button>
        <button type=button role=tab aria-selected="${isSignUp}" data-a=authmode data-v=signup>Create account</button>
      </div>
      <h2 id=authTitle>${isSignUp ? 'Start your learning journey' : 'Welcome back'}</h2>
      <p class=mu>${isSignUp ? 'Create an account to keep your learning in one place.' : 'Sign in to continue learning Ikwerre.'}</p>
      <form id=authForm class=auth-fields>
        ${isSignUp ? `<label for=authName>Your name<input id=authName name=name type=text autocomplete=name maxlength=80 required value="${esc(authName)}" placeholder="Your name"></label>` : ''}
        <label for=authEmail>Email address<input id=authEmail name=email type=email autocomplete=email maxlength=254 required value="${esc(authEmail)}" placeholder="you@example.com"></label>
        <label for=authPassword>Password<input id=authPassword name=password type=password autocomplete="${isSignUp ? 'new-password' : 'current-password'}" minlength=8 maxlength=128 required placeholder="${isSignUp ? 'At least 8 characters' : 'Your password'}"></label>
        ${isSignUp ? '<label for=authPasswordConfirm>Confirm password<input id=authPasswordConfirm name=passwordConfirm type=password autocomplete=new-password minlength=8 maxlength=128 required placeholder="Re-enter your password"></label>' : ''}
        ${isSignUp ? '<label class=checkline><input type=checkbox name=emailRemindersEnabled>Send me a weekly learning reminder if I have signed in fewer than three times this week. Unsubscribe any time.</label>' : ''}
        ${authMessage ? `<p class=${authMessageType==='success'?'auth-success':'auth-error'} role=${authMessageType==='success'?'status':'alert'} aria-live=polite>${esc(authMessage)}</p>` : ''}
        <button type=submit class=btn ${authBusy ? 'disabled' : ''}>${authBusy ? 'Please wait…' : accountAction}</button>
        ${!isSignUp ? '<div class=auth-links><button type=button class=auth-link data-a=authmode data-v=forgot>Forgot your password?</button></div>' : ''}
      </form>
    </section>
    ${guestAccessEnabled ? '<button type=button class="ghost auth-preview" data-a=preview>Continue as guest</button><p class=mu style="text-align:center;font-size:13px">Guest progress stays on this device until you create an account.</p>' : ''}
  </main>`;
}

function markupForCurrentScreen() {
  if (!previewMode) {
    return authScreen();
  }

  if (!S.ob || forceOnboardingPreview) {
    return onboard();
  }
  if (L) {
    return lessonView();
  }

  const screens = {
    learn,
    practice,
    hub: hubv,
    quests,
    profile,
    studio,
    editor,
    admin: adminScreen,
  };
  const content = screens[tab]();
  const tabs = [
    ['learn', '🏠', 'Learn'],
    ['practice', '💪', 'Practice'],
    ['hub', '🧭', 'Hub'],
    ['quests', '🎯', 'Quests'],
    ['profile', '👤', 'Me'],
  ];

  return (
    content +
    (accountUser && accountUser.isPremium ? '' : getAdMarkup()) +
    `<nav class=tabs><div>${tabs.map((item)=>`<button class="${tab===item[0]?'on':''}" data-a=tab data-v=${item[0]}><i>${item[1]}</i>${item[2]}</button>`).join('')}</div></nav>`
  );
}

let refreshApp;
function render() {
  if (refreshApp) refreshApp();
}

function advanceOnboarding() {
  if (step < 7) {
    step++;
    S.onboardingStep = step;
  } else {
    S.ob = 1;
    S.onboardingStep = 0;
    step = 0;
    forceOnboardingPreview = false;
  }

  save();
  render();
}

let reminderTimer = null;

function scheduleReminder() {
  if (reminderTimer !== null) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }

  if (
    !S.reminders ||
    typeof Notification === 'undefined' ||
    Notification.permission !== 'granted'
  ) {
    return;
  }

  const time = /^(\d{1,2}):(\d{2}) (AM|PM)$/i.exec(S.rt || '7:00 PM');
  if (!time) return;

  const hour = (+time[1] % 12) + (time[3].toUpperCase() === 'PM' ? 12 : 0);
  const now = new Date();
  const nextReminder = new Date(now);
  nextReminder.setHours(hour, +time[2], 0, 0);
  if (nextReminder <= now) nextReminder.setDate(nextReminder.getDate() + 1);

  reminderTimer = setTimeout(() => {
    reminderTimer = null;
    if (!S.reminders || Notification.permission !== 'granted') return;

    try {
      const notification = new Notification('Time for Ikwerre!', {
        body: 'Take a few minutes to practise your words.',
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      S.reminders = 0;
      save();
      toast('The browser could not show the reminder. Check notification permission.');
      return;
    }

    scheduleReminder();
  }, nextReminder.getTime() - now.getTime());
}

async function enableReminder() {
  const reminderTime = $('#rt');
  if (reminderTime) S.rt = reminderTime.value;

  if (typeof Notification === 'undefined' || !window.isSecureContext) {
    S.reminders = 0;
    save();
    toast('Notifications need a supported browser and a secure page.');
    return false;
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (error) {
      S.reminders = 0;
      save();
      toast('The browser could not request notification permission.');
      return false;
    }
  }

  if (permission !== 'granted') {
    S.reminders = 0;
    save();
    toast('Notifications were not allowed. You can enable them in browser settings.');
    return false;
  }

  S.reminders = 1;
  save();
  scheduleReminder();
  toast('Daily reminder enabled while the app is open.');
  return true;
}

async function enableReminderDuringOnboarding() {
  await enableReminder();
  advanceOnboarding();
}

function restoreProgressState(progress) {
  S = { ...createDefaultProgress(), ...progress };
  if (!Number.isFinite(progress.mtMs) || progress.mtMs < 0) {
    S.mt = 0;
    S.mtMs = 0;
  }
  step = Number.isInteger(S.onboardingStep)
    ? Math.min(7, Math.max(0, S.onboardingStep))
    : 0;
  fam = S.fam || '';
  why = S.why || '';
}

async function finishAccountSignIn(user) {
  accountUser = user;
  const accountProgress = await loadAccountProgress();
  if (accountProgress) {
    restoreProgressState(accountProgress);
    await save();
  } else {
    await save();
  }

  previewMode = true;
  forceOnboardingPreview = !S.ob;
  authMessage = '';
  authName = S.name || user.name;
  render();
}

async function submitAuthForm() {
  const form = $('#authForm');
  if (!form || !form.reportValidity()) return;

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const passwordConfirm = String(formData.get('passwordConfirm') || '');
  const name = String(formData.get('name') || '').trim();
  const emailRemindersEnabled = formData.get('emailRemindersEnabled') === 'on';
  authEmail = email || authEmail;
  authMessage = '';
  authMessageType = 'error';

  if (authMode === 'reset' && password !== passwordConfirm) {
    authMessage = 'Passwords do not match.';
    render();
    return;
  }
  if (authMode === 'signup' && password !== passwordConfirm) {
    authMessage = 'Passwords do not match.';
    render();
    return;
  }
  if (name) authName = name;
  authBusy = true;
  render();

  try {
    if (authMode === 'forgot') {
      const result = await requestPasswordReset(email);
      authMessage = result.message;
      authMessageType = 'success';
    } else if (authMode === 'reset') {
      const result = await resetAccountPassword({
        token: passwordResetToken,
        password,
      });
      passwordResetToken = '';
      authMode = 'signin';
      authMessage = result.message;
      authMessageType = 'success';
    } else if (authMode === 'signup') {
      const result = await signUpAccount({
        name,
        email,
        password,
        emailRemindersEnabled,
      });
      authEmail = result.email;
      authMode = 'verify';
      authMessage = result.message;
    } else {
      const user = await signInAccount({ email, password });
      await finishAccountSignIn(user);
    }
  } catch (error) {
    if (error.code === 'EMAIL_NOT_VERIFIED' || error.code === 'ACCOUNT_EXISTS') {
      authMode = 'verify';
    }
    authMessage = error.message || 'Could not complete account access.';
    authMessageType = 'error';
    render();
  } finally {
    authBusy = false;
    render();
  }
}

async function submitPasswordChange() {
  const form = $('#passwordChangeForm');
  if (!form || !form.reportValidity()) return;
  const formData = new FormData(form);
  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const newPasswordConfirm = String(formData.get('newPasswordConfirm') || '');
  if (newPassword !== newPasswordConfirm) {
    toast('Your new passwords do not match.');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Please wait…';
  }
  try {
    accountUser = await changeAccountPassword({ currentPassword, newPassword });
    form.reset();
    toast('Your password has been updated. Other sessions were signed out.');
  } catch (error) {
    toast(error.message || 'Could not change your password.');
  } finally {
    if (submitButton?.isConnected) {
      submitButton.disabled = false;
      submitButton.textContent = 'Update password';
    }
  }
}

async function restoreAccountSession() {
  const url = new URL(window.location.href);
  if (url.pathname === '/verify-email') {
    const token = url.searchParams.get('token') || '';
    history.replaceState(null, '', '/');
    authMode = 'verify';
    authEmail = '';
    authMessage = 'Verifying your email…';
    render();
    try {
      const user = await verifyEmailAddress(token);
      await finishAccountSignIn(user);
      toast('Email verified. You are signed in.');
    } catch (error) {
      authMessage = error.message || 'Could not verify this email address.';
      authMessageType = 'error';
      render();
    }
    return;
  }
  if (url.pathname === '/reset-password') {
    passwordResetToken = url.searchParams.get('token') || '';
    history.replaceState(null, '', '/');
    authMode = 'reset';
    authMessage = passwordResetToken
      ? ''
      : 'This password reset link is invalid or missing. Request a new one from the sign-in page.';
    render();
    return;
  }

  const user = await restoreSession();
  if (!user) return;

  await finishAccountSignIn(user);
  const reference = new URLSearchParams(location.search).get('reference');
  if (reference) {
    try {
      const result = await verifyPremiumPayment(reference);
      accountUser = result.user;
      toast(result.message);
    } catch (error) {
      toast(error.message);
    } finally {
      history.replaceState(null, '', location.pathname);
      render();
    }
  }
}

/* ===== events ===== */
function handleClick(event) {
  const button = event.target.closest('[data-a]');
  if (!button) return;

  const action = button.dataset.a;
  const value = button.dataset.v;

  switch (action) {
    case 'authmode':
      authMode = value;
      authMessage = '';
      authMessageType = 'error';
      render();
      break;
    case 'resend-verification':
      if (!authEmail || authBusy) break;
      authBusy = true;
      authMessage = '';
      render();
      resendVerificationEmail(authEmail)
        .then((result) => {
          authMessage = result.message;
          authMessageType = 'success';
        })
        .catch((error) => {
          authMessage = error.message || 'Could not send a verification email.';
          authMessageType = 'error';
        })
        .finally(() => {
          authBusy = false;
          render();
        });
      break;
    case 'admin':
      tab = 'admin';
      adminSummaryData = null;
      adminLoading = true;
      adminError = '';
      render();
      loadAdminSummary()
        .then((result) => {
          adminSummaryData = result;
        })
        .catch((error) => {
          adminError = error.message || 'Could not load the owner dashboard.';
        })
        .finally(() => {
          adminLoading = false;
          render();
        });
      break;
    case 'preview':
      if (!guestAccessEnabled) break;
      previewMode = true;
      forceOnboardingPreview = false;
      render();
      break;
    case 'onboard-preview':
      if (!guestAccessEnabled) break;
      previewMode = true;
      forceOnboardingPreview = true;
      step = 0;
      S.onboardingStep = 0;
      save();
      render();
      break;
    case 'account':
      previewMode = false;
      authMode = 'signup';
      authName = '';
      authMessage = '';
      render();
      break;
    case 'signout':
      signOutAccount()
        .then(() => {
          setAccountSession(false);
          accountUser = null;
          adminSummaryData = null;
          previewMode = false;
          authMode = 'signin';
          authName = '';
          authMessage = '';
          render();
        })
        .catch((error) => toast(error.message));
      break;
    case 'premium-start':
      if (!accountUser) {
        previewMode = false;
        authMode = 'signup';
        authMessage = 'Create an account to start Premium.';
        render();
      } else {
        startPremiumCheckout()
          .then((url) => window.location.assign(url))
          .catch((error) => toast(error.message));
      }
      break;
    case 'premium-cancel':
      cancelPremiumSubscription()
        .then((result) => {
          accountUser = result.user;
          toast(`Premium remains active until ${result.premiumUntil || 'the end of your billing period'}.`);
          render();
        })
        .catch((error) => toast(error.message));
      break;
    case 'say':
      say(value);
      break;
    case 'slow':
      say(value, 1);
      break;
    case 'apx':
      S.apx = S.apx === 0 ? 1 : 0;
      save();
      render();
      break;
    case 'rec':
      toggleRec(value);
      break;
    case 'edit':
      tab = 'editor';
      render();
      break;
    case 'savec':
      saveCourse($('#ct').value);
      location.reload();
      break;
    case 'resetc':
      resetCourse();
      location.reload();
      break;
    case 'ob':
      if (step === 2) {
        const name = $('#nm');
        S.name = name ? name.value.trim() : '';
        save();
      }
      advanceOnboarding();
      break;
    case 'reminder-enable':
      enableReminderDuringOnboarding();
      break;
    case 'reminder-skip': {
      const reminderTime = $('#rt');
      if (reminderTime) S.rt = reminderTime.value;
      S.reminders = 0;
      save();
      scheduleReminder();
      advanceOnboarding();
      break;
    }
    case 'reminders':
      if (S.reminders) {
        S.reminders = 0;
        save();
        scheduleReminder();
        toast('Daily reminder turned off.');
        render();
      } else {
        enableReminder().then(() => render());
      }
      break;
    case 'fam':
      fam = value;
      S.fam = value;
      save();
      render();
      break;
    case 'tile': {
      const question = L.q[L.i];
      const index = +value;
      question.pick = question.pick.includes(index)
        ? question.pick.filter((item) => item !== index)
        : [...question.pick, index];
      render();
      break;
    }
    case 'again': {
      const lesson = L.id && LS.find((item) => item.id === L.id);
      L = null;
      if (lesson) {
        start(lesson.id, lesson.w);
      } else {
        render();
      }
      break;
    }
    case 'why':
      why = value;
      S.why = value;
      save();
      render();
      break;
    case 'goal':
      S.goal = +value;
      save();
      render();
      break;
    case 'tab':
      tab = value;
      hub = null;
      render();
      scrollTo(0, 0);
      break;
    case 'hubopen':
      hub = { k: button.dataset.k, i: +value };
      hq = null;
      render();
      scrollTo(0, 0);
      break;
    case 'utog': {
      const unitIndex = +value;
      const currentIndex = LS.findIndex((lesson) => !S.done[lesson.id]);
      const currentUnit = currentIndex < 0 ? U.length - 1 : LS[currentIndex].u;

      if (unitIndex > currentUnit) {
        toast('Finish the earlier units to unlock this one.');
      } else {
        const openUnit = openU == null ? currentUnit : openU;
        openU = openUnit === unitIndex ? -1 : unitIndex;
        render();
      }
      break;
    }
    case 'uall':
      allU = !allU;
      render();
      break;
    case 'hubback':
      hub = null;
      hq = null;
      render();
      break;
    case 'hq':
      hq = +value;
      render();
      break;
    case 'node': {
      const lessonIndex = +value;
      const lesson = LS[lessonIndex];
      const currentIndex = LS.findIndex((item) => !S.done[item.id]);

      if (S.done[lesson.id] || lessonIndex === currentIndex) {
        start(lesson.id, lesson.w);
      } else {
        toast('Finish the previous lesson to unlock this one.');
      }
      break;
    }
    case 'pmiss':
      start(
        null,
        S.miss.slice(0, 3).length >= 3 ? S.miss.slice(-3) : padTo3(S.miss),
        1
      );
      break;
    case 'pmix':
      start(null, sh(learned()).slice(0, 3), 1);
      break;
    case 'pick':
      L.sel = value;
      render();
      break;
    case 'check':
      check();
      break;
    case 'mt':
      mtap(button);
      break;
    case 'next': {
      const previous = L.q[L.i];
      L.fb = null;
      L.sel = null;

      if (previous && (previous.k === 'mc' || previous.k === 'listen')) {
        const side = previous.k === 'mc' ? 1 : 0;
        L.lastShownAnswerIndex = previous.o.findIndex(
          (option) => norm(option) === norm(previous.w[side])
        );
      }

      L.i++;
      const question = L.q[L.i];
      if (question && (question.k === 'mc' || question.k === 'listen')) {
        const side = question.k === 'mc' ? 1 : 0;
        question.o = opts(question.w, side, L.lastShownAnswerIndex);
        L.lastShownAnswerIndex = question.o.findIndex(
          (option) => norm(option) === norm(question.w[side])
        );
      }

      render();
      scrollTo(0, 0);
      if (question && question.k === 'teach') say(question.w[0]);
      break;
    }
    case 'quit':
      if (confirm('Quit lesson? Progress in this lesson will be lost.')) {
        stopLessonClock();
        L = null;
        render();
      }
      break;
    case 'home':
      L = null;
      tab = 'learn';
      render();
      scrollTo(0, 0);
      break;
    case 'snd':
      S.snd = S.snd ? 0 : 1;
      save();
      render();
      break;
    case 'reset':
      if (confirm('Erase all progress on this device?')) {
        S = {
          ...S,
          xp: 0,
          streak: 0,
          last: '',
          done: {},
          xpToday: 0,
          mt: 0,
          mtMs: 0,
          lt: 0,
          pt: 0,
          miss: [],
          days: [],
        };
        save();
        render();
      }
      break;
  }
}

function handleInput(event) {
  if (event.target.id === 'authName') {
    authName = event.target.value;
  }
  if (event.target.id === 'authEmail') {
    authEmail = event.target.value;
  }

  if (event.target.id === 'ti') {
    const checkButton = $('[data-a=check]');
    if (checkButton) checkButton.disabled = !event.target.value.trim();
  }

  if (event.target.id === 'profileName') {
    S.name = event.target.value.trim();
    save();
  }
}

function handleSubmit(event) {
  if (event.target.id === 'authForm') {
    event.preventDefault();
    submitAuthForm();
  } else if (event.target.id === 'passwordChangeForm') {
    event.preventDefault();
    submitPasswordChange();
  }
}

function handleKeyDown(event) {
  if (event.target.id !== 'ti' || event.key !== 'Enter') return;
  const checkButton = $('[data-a=check]');
  if (checkButton && !checkButton.disabled) check();
}

async function handleChange(event) {
  const key = event.target.dataset && event.target.dataset.k;
  if (key && event.target.files && event.target.files[0]) {
    await aput(key, event.target.files[0]);
    toast('Saved');
    render();
  }

  if (event.target.id === 'goal') {
    S.goal = +event.target.value;
    save();
  }

  if (event.target.id === 'rt') {
    S.rt = event.target.value;
    save();
    scheduleReminder();
  }

  if (event.target.id === 'emailReminders' && accountUser) {
    const enabled = event.target.checked;
    updateEmailReminderPreference(enabled)
      .then((user) => {
        accountUser = user;
        toast(enabled ? 'Weekly email reminders enabled.' : 'Weekly email reminders turned off.');
        render();
      })
      .catch((error) => {
        event.target.checked = Boolean(accountUser.emailRemindersEnabled);
        toast(error.message || 'Could not update your email reminder preference.');
      });
  }

  if (event.target.id === 'level') {
    S.fam = event.target.value;
    fam = S.fam;
    save();
    toast('Learning level updated. Open a lesson to use this profile.');
  }
}

function padTo3(mistakes) {
  const words = [...mistakes];
  const learnedWords = learned();

  while (words.length < 3) {
    words.push(sh(learnedWords.length ? learnedWords : ALL)[0]);
  }

  return [...new Map(words.map((word) => [word[0], word])).values()].slice(0, 3);
}

const REACT_ATTRIBUTE_NAMES = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  autocomplete: 'autoComplete',
  autocapitalize: 'autoCapitalize',
  spellcheck: 'spellCheck',
  contenteditable: 'contentEditable',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'xlink:href': 'xlinkHref',
  viewbox: 'viewBox',
};
const BOOLEAN_ATTRIBUTES = new Set([
  'allowfullscreen',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'ismap',
  'loop',
  'multiple',
  'muted',
  'novalidate',
  'open',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
]);

function reactAttributeName(name) {
  if (name.startsWith('aria-') || name.startsWith('data-')) return name;
  return (
    REACT_ATTRIBUTE_NAMES[name] ||
    name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  );
}

function styleObject(element) {
  const styles = {};
  for (const property of element.style) {
    const name = property.startsWith('--')
      ? property
      : property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    styles[name] = element.style.getPropertyValue(property).trim();
  }
  return styles;
}

function htmlNodeToReact(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tagName = node.tagName.toLowerCase();
  const props = { key };

  for (const attribute of node.attributes) {
    const name = attribute.name.toLowerCase();
    if (name === 'selected') continue;
    if (name === 'style') {
      props.style = styleObject(node);
      continue;
    }

    const propName = reactAttributeName(name);
    if (name === 'value' && (tagName === 'input' || tagName === 'textarea')) {
      props.defaultValue = attribute.value;
    } else if (name === 'checked' && tagName === 'input') {
      props.defaultChecked = true;
    } else if (BOOLEAN_ATTRIBUTES.has(name)) {
      props[propName] = true;
    } else {
      props[propName] = attribute.value;
    }
  }

  if (tagName === 'select') {
    const selectedValues = Array.from(node.querySelectorAll('option[selected]'))
      .filter((option) => option.closest('select') === node)
      .map((option) => option.value);
    if (selectedValues.length) {
      props.defaultValue = node.multiple ? selectedValues : selectedValues[0];
    }
  }

  const children = Array.from(node.childNodes)
    .map((child, index) => htmlNodeToReact(child, `${key}-${index}`))
    .filter((child) => child !== null);
  return createElement(tagName, props, ...children);
}

function ReactMarkup({ html }) {
  const document = new DOMParser().parseFromString(
    `<body>${html}</body>`,
    'text/html'
  );
  const children = Array.from(document.body.childNodes)
    .map((node, index) => htmlNodeToReact(node, `root-${index}`))
    .filter((node) => node !== null);
  return createElement(React.Fragment, null, ...children);
}

export default function App() {
  const [, forceRender] = useReducer((version) => version + 1, 0);
  refreshApp = forceRender;

  useEffect(() => {
    scheduleReminder();
    aload();
    try {
      if (typeof speechSynthesis !== 'undefined') speechSynthesis.getVoices();
    } catch (error) {
      console.error('Could not prepare the speech voices.', error);
    }
    const handleServiceError = (event) => toast(event.detail.message);
    const handleBeforeUnload = () => stopLessonClock();
    window.addEventListener('app:service-error', handleServiceError);
    window.addEventListener('beforeunload', handleBeforeUnload);
    restoreAccountSession().catch((error) => {
      console.error('Could not restore the account session.', error);
      toast('Account service is unavailable. You can continue as a guest.');
    });
    return () => {
      window.removeEventListener('app:service-error', handleServiceError);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (reminderTimer !== null) clearTimeout(reminderTimer);
      stopLessonClock();
    };
  }, []);

  useEffect(() => {
    if (previewMode && S.ob && !L && !(accountUser && accountUser.isPremium)) {
      loadAdSense();
    }
  });

  roll();
  return (
    <div
      className="app-root"
      onClick={handleClick}
      onChange={handleChange}
      onInput={handleInput}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <ReactMarkup html={markupForCurrentScreen()} />
    </div>
  );
}