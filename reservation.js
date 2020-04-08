function app() {

  return {
    checkAgainAfter: 10000, // miliseconds
    // deliveryDate: '2020/5/25',
    userId: '527522',
    division: 'WAW',
    features: 'BalanceAmount=1',
    visitorId: "aa28c9bf-bce9-44dd-854b-823844febafb",
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Mjc1MjIiLCJ2aXNpdG9yX2lkIjoiYWEyOGM5YmYtYmNlOS00NGRkLTg1NGItODIzODQ0ZmViYWZiIiwidG9rZW5fdXNhZ2UiOiJhY2Nlc3NfdG9rZW4iLCJqdGkiOiI4NzAzMzY5OC1iN2U4LTQ1OWEtOTExZi1iNzJiODYyYTJlNGQiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmJmIjoxNTg2MjQ1MzU0LCJleHAiOjE1ODYyNDU5NTQsImlhdCI6MTU4NjI0NTM1NCwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZS5mcmlzY28ucGwvIn0.Bd0pbZpnpkb189M3_3sffoO9ibJ9CGzGE3RD4krT0Vs', // 600 seconds timeout
    getRefreshTokenUrl() {
      return 'https://commerce.frisco.pl/connect/token'
    },
    getSlotsUrl(reservationDate) {
      return 'https://commerce.frisco.pl/api/users/'+this.userId+'/calendar/Van/'+reservationDate
    },
    getReservationUrl() {
      return 'https://commerce.frisco.pl/api/users/'+this.userId+'/cart/reservation'
    },
    getAuth() {
      return "Bearer "+this.token;
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    getSlots(reservationDate) {
        const h = new XMLHttpRequest();
        h.open("GET", this.getSlotsUrl(reservationDate), false);

        h.setRequestHeader("Authorization", this.getAuth());
        h.setRequestHeader("x-frisco-division", this.division);
        h.setRequestHeader("x-frisco-features", this.features);
        h.setRequestHeader("x-frisco-visitorid", this.visitorId);

        try {
          h.send();
        } catch (err) {
          console.error(err);
        }

        return h;
    },
    makeReservation(data, callback, errorCallback) {
      console.log('making reservation...');
      delete data['isMondayAfterNonTradeSunday'];

      const h = new XMLHttpRequest();
      h.open("POST", this.getReservationUrl(), false);

      h.setRequestHeader("Content-Type", "application/json");
      h.setRequestHeader("Authorization", this.getAuth());
      h.setRequestHeader("x-frisco-division", this.division);
      h.setRequestHeader("x-frisco-features", this.features);
      h.setRequestHeader("x-frisco-visitorid", this.visitorId);

      try {
        h.send(JSON.stringify(data));
      } catch (err) {
        console.error(err);
      }

      return h;
    },
    async runner(reservationDate, priority, reservation) {
      let self = this;
      let madeReservation = false;
      let errored = false;
      while (!madeReservation) {
        slotsResponse = this.getSlots(reservationDate);

        if (slotsResponse.status == 401) {
          console.error("Token timeouted");
          return Promise.resolve();
          // break;
        }
        // console.log(slotsResponse);
        let response = slotsResponse.response;
        let slots = JSON.parse(response);
        let unavailable = [];
        for (let i = 0; i < slots.length; i++) {
          slot = slots[i];
          if (
            (slot.canReserve && !reservation.isReserved)
            || (slot.canReserve && reservation.isReserved && priority < reservation.dayPriority)
          ) {
            console.log("free slot!");

            reservationResponse = this.makeReservation(slot.deliveryWindow);
            if (reservationResponse.status == 204) {
              reservation.isReserved = true;
              reservation.slot = slot;
              reservation.dayPriority = priority;
              console.info("[!!] RESERVATION SUCCESSFUL");
              console.info("> From: ");
              console.info(new Date(slot.deliveryWindow.startsAt).toString())
              console.info("> To: ");
              console.info(new Date(slot.deliveryWindow.endsAt).toString())
              madeReservation = true;
            }
            console.log(reservationResponse);

            if (madeReservation) {
              return Promise.resolve();
              // break;
            }
          } else {
            unavailable.push(slot.deliveryWindow.startsAt);
            // console.info("slot "+slot.deliveryWindow.startsAt+ " unavailable");
          }
        }
        console.info(unavailable.length+"/"+slots.length+" slots unavailable for "+reservationDate+", checking again in: "+this.checkAgainAfter+"ms");

        await this.sleep(this.checkAgainAfter);
      }
    }
  }
}
(function() {
  const reservation = {
    isReserved: false,
    dayPriority: null,
    slot: null
  };
  Promise
    .all([ // list of days with priorities, the lower number the higher priority
      // app().runner('2020/04/07', 0, reservation),
      // app().runner('2020/04/08', 1, reservation),
      app().runner('2020/04/09', 2, reservation),
      app().runner('2020/04/10', 3, reservation),
      app().runner('2020/04/11', 4, reservation),
      app().runner('2020/04/14', 5, reservation),
    ])
    .then(function (results) {
      console.log(reservation);
    });
})();




