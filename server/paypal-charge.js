exports.handler = async (event, context) => {
    
    if (event.httpMethod === "GET") {
        const createOrderPayload = {
            purchase_units: [
                {
                    amount: {
                        value: "100.00"
                    }
                }
            ]
        };

        return {
            statusCode: 200,
            body: JSON.stringify({createOrderPayload:createOrderPayload}),
          };
    } else {
      return {
          statusCode: 400,
          body: JSON.stringify({message: "METHOD NOT ALLOWED"}),
        };
    }
  };