"use client";
import "/assets/css/Home.scss";
import LeftAsideNews from "./components/LeftAsideNews";
import RightBsideNews from "./components/RightBsideNews";
import SearchBar from "material-ui-search-bar";
import React, { useEffect, useState } from "react";
import NewsBlock, {SkeletonNewsBlock} from "./components/NewsBlock";
import MarketTicker from "./components/MarketTicker";
import Link from "next/link";
import SkeletonCard from "./components/SkeletonCard";
import { news } from "./utilfunctions/interfaces";
import ExploreLayout from "./components/ExploreLayout";

function getRandomElement(array: news[]) {
  const randomIndex = Math.floor(Math.random() * array.length);
  const randomElement = array[randomIndex];
  return randomElement;
}

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [mainNewsContainer, setMainNewsContainer] = useState<news[]>([]);
  const [latestNews, setLatestNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [marketTickerData, setMarketTickerData] = useState(<></>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMainNewsArticle = async () => {
      try {
        const articleType = localStorage.getItem("articleType");
        const response = await fetch(
          `/api/searcharticles?articleType=${
            articleType ? articleType : "random"
          }&num=9&randomize=true`
        );
        const data = await response.json();
        if (response.ok) {
          setMainNewsContainer(data);
          // Store category in localStorage
          if (data.type) {
            localStorage.setItem("articleType", data.type);
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTrendingNewsArticle = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?num=20&randomize=true`
        );
        let data = await response.json();
        if (response.ok) {
          const randomElement = getRandomElement(data.slice(1) || data);
          setMarketTickerData(
            <>
              <Link href={`/view/${randomElement.articleId}`}>
                Breaking News: {randomElement.title}
              </Link>
            </>
          );
          data = data.slice(0, 10);
          setTrendingNews(data);
          // Store category in localStorage
          if (data.type) {
            localStorage.setItem("articleType", data.type);
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    const fetchLatestNewsArticle = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?articleType=random&num=8&order=DESC`
        );
        const data = await response.json();
        if (response.ok) {
          setLatestNews(data);
          // Store category in localStorage
          if (data.type) {
            localStorage.setItem("articleType", data.type);
          }
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
      }
    };

    fetchMainNewsArticle();
    fetchTrendingNewsArticle();
    fetchLatestNewsArticle();
  }, []);

  useEffect(() => {
    const fetchSearchOptions = async () => {
      try {
        const response = await fetch(
          `/api/searcharticles?query=${encodeURIComponent(searchValue)}`
        );
        const data = await response.json();
        if (response.ok) {
          setSearchOptions(data);
        } else {
          setSearchOptions([]);
        }
      } catch (error) {
        setSearchOptions([]);
        console.error("Failed to fetch article:", error);
      }
    };
    fetchSearchOptions();
  }, [searchValue]);

  const HomeLayout = () => {
    return (
      <div className="container">
        <LeftAsideNews trendingNews={trendingNews} />

        <div
          className="home-main"
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {loading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="content-card">
                <img
                  src={mainNewsContainer[0]?.lphoto}
                  alt="title"
                  className="content-card__image"
                />
                <div className="content-card__content">
                  <h3 className="content-card__title">
                    {mainNewsContainer[0]?.title}
                  </h3>
                  <p className="content-card__description">
                    {mainNewsContainer[0]?.description}
                  </p>
                  <a href={`/view/${mainNewsContainer[0]?.articleId || ""}`}>
                    <p className="content-card__see-more">See More</p>
                  </a>
                </div>
              </div>
            </>
          )}
          <div className="more-main-news">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonNewsBlock key={i} />
                ))
              : mainNewsContainer.slice(1).map((news, i) => (
                  <div key={i}>
                    <hr />
                    <NewsBlock news={news} />
                  </div>
                ))}
          </div>
        </div>
        <aside className="right-aside">
          <RightBsideNews latestNews={latestNews} />
        </aside>
        <div className="footer" style={{ display: "none" }}>
          Footer
        </div>
      </div>
    );
  };

  return (
    <main>
      <div className="search-bar-wrapper">
        <SearchBar
          style={{ width: "90%", maxWidth: "500px" }}
          value={searchValue}
          onChange={(newValue) => setSearchValue(newValue)}
          onCancelSearch={() => setSearchValue("")}
          placeholder="Search News, markets, photos, videos...."
        />
      </div>
      <MarketTicker data={marketTickerData} />
      {searchValue ? (
        <ExploreLayout
          articles={searchOptions}
          zeroArticleMsg={`No Articles Found for "${searchValue}"`}
        />
      ) : (
        <HomeLayout />
      )}
    </main>
  );
}
