    ovo je za concepts: 

  - reduceri
    - da bi shvatili kako se mijenja state, ne moramo tražit onClick, onChange evente u viewu i pratit program sve do setState
    - dovoljno je samo definirat pod kojim uvjetima se treba pokrenut funkcija koja će promijenit state
    - primjer jednostavnog observabla
    - ali šta je sa child komponentama?
    - često, da bi shvatili kako aplikacija radi, do naredbe setState (ili pozivanja redux akcije) moramo pratit
      program kroz nekoliko fileova - to je imerativni način. a ako želimo deklarativni na jednom mjestu moraju pisat uvjeti za pokretanje
      reducera, uključujući i evente od child komponente.
      A to je moguće zbog druge bitne stvari - akcija
  - akcije
    - trenutni imperativni način na koji komponenta interaktira sa ostatkom appa je da pokreće callback propsa koji joj se šalje
    - deklarativni način je da komponenta definira svoj API prema van, pa tko oće koristit tu informaciju može
      - komponenta nije odgovorna za egzekuciju callbacka
  - side Effects
      - isto kako parent sluša childa, driver pak može čut sve 

