export const processNotification = async (payload) => {

    console.log();
    console.log("Notification Processor Started");
    console.log();
    if (!payload.userId || !payload.title || !payload.message) {
        throw new Error("Invalid notification payload");
    }

    console.log(`User ID : ${payload.userId}`);
    console.log(`Title   : ${payload.title}`);
    console.log(`Message : ${payload.message}`);
    console.log();

    // Simulate notification delivery delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Notification Delivered Successfully");
    console.log();
};