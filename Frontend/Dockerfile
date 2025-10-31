# best for android based app 
FROM ubuntu:22.04 
# Install dependencies
RUN apt-get update && \
    apt-get install -y curl git unzip openjdk-17-jdk wget build-essential && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs 

# Install Android SDK command line tools
RUN mkdir -p /opt/android-sdk/cmdline-tools/latest && \
    cd /opt/android-sdk/cmdline-tools/latest && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O tools.zip && \
    unzip tools.zip && rm tools.zip


ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$ANDROID_HOME/cmdline-tools/cmdline-tools/bin:$ANDROID_HOME/platform-tools:$PATH

# Accept Android licenses
RUN sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
RUN yes | sdkmanager --licenses



WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

WORKDIR /app/android
CMD ["./gradlew", "assembleRelease"]