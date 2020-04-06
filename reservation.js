function app() {

  return {
    checkAgainAfter: 20000, // miliseconds
    deliveryDate: '2020/5/25',
    userId: '527522',
    visitorId: "f269f08c-1fe4-4eac-83fa-ea12ee9cc1cf",
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Mjc1MjIiLCJ2aXNpdG9yX2lkIjoiZjI2OWYwOGMtMWZlNC00ZWFjLTgzZmEtZWExMmVlOWNjMWNmIiwidG9rZW5fdXNhZ2UiOiJhY2Nlc3NfdG9rZW4iLCJqdGkiOiI5MGY1ODFlZS05NDMwLTQwNmMtYjdkMi1lYjliMTQ3YTNmZjkiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmJmIjoxNTg2MTY4MDY0LCJleHAiOjE1ODYxNjg2NjQsImlhdCI6MTU4NjE2ODA2NCwiaXNzIjoiaHR0cHM6Ly9jb21tZXJjZS5mcmlzY28ucGwvIn0.sKXCdEnevjL40B-vzh90OV6-F918hWU_Mou4z5K5a5Q', // 600 seconds timeout
    getRefreshTokenUrl() {
      return 'https://commerce.frisco.pl/connect/token'
    },
    getSlotsUrl() {
      return 'https://commerce.frisco.pl/api/users/'+this.userId+'/calendar/Van/'+this.deliveryDate
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
    getSlots(callback, errorCallback) {
        const h = new XMLHttpRequest();
        h.open("GET", this.getSlotsUrl(), false);

        h.setRequestHeader("Authorization", this.getAuth());
        h.setRequestHeader("x-frisco-division", "WAW");
        h.setRequestHeader("x-frisco-features", "BalanceAmount=1");
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
      h.setRequestHeader("x-frisco-division", "WAW");
      h.setRequestHeader("x-frisco-features", "BalanceAmount=1");
      h.setRequestHeader("x-frisco-visitorid", this.visitorId);
      
      try {
        h.send(JSON.stringify(data));
      } catch (err) {
        console.error(err);
      }

      return h;
    },
    async runner() {
      let self = this;
      let madeReservation = false;
      let errored = false;
      while (!madeReservation) {
        slotsResponse = this.getSlots();

        if (slotsResponse.status == 401) {
          console.error("Token timeouted");
          console.error(slotsResponse);
          break;
        }
        console.log(slotsResponse);
        let response = slotsResponse.response;
        let slots = JSON.parse(response);
        for (let i = 0; i < slots.length; i++) {
          slot = slots[i];
          if (slot.canReserve) {
            console.log("free slot!");

            reservationResponse = this.makeReservation(slot.deliveryWindow);
            if (reservationResponse.status == 204) {
              console.info("[!!] RESERVATION SUCCESSFUL");
              console.info("> From: ");
              console.info(new Date(slot.deliveryWindow.startsAt).toString())
              console.info("> To: ");
              console.info(new Date(slot.deliveryWindow.endsAt).toString())
              madeReservation = true;
            }
            console.log(reservationResponse);

            if (madeReservation) break;
          } else {
            console.log("slot "+slot.deliveryWindow.startsAt+ " is closed");
          }
        }

        await this.sleep(this.checkAgainAfter);
      }
    }
  }
}
app().runner();



